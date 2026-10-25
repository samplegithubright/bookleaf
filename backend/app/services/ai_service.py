import json
import logging
import re
from typing import Optional, Dict, Any, Tuple
from app.config import settings
from app.services.knowledge_base import BOOKLEAF_KNOWLEDGE_BASE

logger = logging.getLogger("bookleaf.ai")

VALID_CATEGORIES = [
    "Royalty & Payments",
    "ISBN & Metadata Issues",
    "Printing & Quality",
    "Distribution & Availability",
    "Book Status & Production Updates",
    "General Inquiry"
]

VALID_PRIORITIES = ["Critical", "High", "Medium", "Low"]

class AIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.client = None
        if self.api_key:
            try:
                from openai import AsyncOpenAI
                self.client = AsyncOpenAI(api_key=self.api_key)
                logger.info(f"OpenAI client initialized with model {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}. Falling back to rule-based engine.")

    async def classify_and_score(
        self,
        subject: str,
        description: str,
        book_info: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, str, str]:
        """
        Returns: (category, priority, reasoning)
        """
        if self.client:
            try:
                return await self._openai_classify(subject, description, book_info)
            except Exception as e:
                logger.error(f"OpenAI classification error: {e}. Using fallback rule-based classification.")
        
        return self._heuristic_classify(subject, description, book_info)

    async def generate_draft_response(
        self,
        author_name: str,
        subject: str,
        description: str,
        category: str,
        priority: str,
        book_info: Optional[Dict[str, Any]] = None,
        custom_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates an empathetic, high-context AI response tailored to BookLeaf policies.
        """
        if self.client:
            try:
                res = await self._openai_draft(
                    author_name=author_name,
                    subject=subject,
                    description=description,
                    category=category,
                    priority=priority,
                    book_info=book_info,
                    custom_instructions=custom_instructions
                )
                res["is_fallback"] = False
                return res
            except Exception as e:
                logger.error(f"OpenAI draft error: {e}. Using fallback generator.")

        res = self._heuristic_draft(
            author_name=author_name,
            subject=subject,
            description=description,
            category=category,
            priority=priority,
            book_info=book_info,
            custom_instructions=custom_instructions
        )
        res["is_fallback"] = True
        return res

    def _select_relevant_kb(self, category: str) -> str:
        """Cost-awareness: Extract only the relevant KB slice instead of entire corpus"""
        cat_lower = category.lower()
        if "royalty" in cat_lower or "payment" in cat_lower:
            return json.dumps(BOOKLEAF_KNOWLEDGE_BASE["royalty_policy"], indent=2)
        elif "isbn" in cat_lower or "metadata" in cat_lower:
            return json.dumps(BOOKLEAF_KNOWLEDGE_BASE["isbn_policy"], indent=2)
        elif "print" in cat_lower or "quality" in cat_lower:
            return json.dumps(BOOKLEAF_KNOWLEDGE_BASE["printing_and_quality"], indent=2)
        elif "distribut" in cat_lower or "availab" in cat_lower:
            return json.dumps(BOOKLEAF_KNOWLEDGE_BASE["distribution_and_availability"], indent=2)
        elif "status" in cat_lower or "production" in cat_lower:
            return f"Production Stages: {json.dumps(BOOKLEAF_KNOWLEDGE_BASE['production_stages'], indent=2)}"
        else:
            return json.dumps(BOOKLEAF_KNOWLEDGE_BASE["company_overview"], indent=2)

    async def _openai_classify(
        self, subject: str, description: str, book_info: Optional[Dict[str, Any]]
    ) -> Tuple[str, str, str]:
        prompt = f"""You are the triage AI for BookLeaf Publishing author support.
Analyze the following author support ticket:
Subject: {subject}
Description: {description}
Book Context: {json.dumps(book_info or {}, default=str)}

Categories allowed:
- Royalty & Payments
- ISBN & Metadata Issues
- Printing & Quality
- Distribution & Availability
- Book Status & Production Updates
- General Inquiry

Priorities allowed:
- Critical (e.g. royalties overdue by months, severe financial discrepancies, duplicate/damaged bulk batch)
- High (e.g. ISBN mismatch on store, author copies severely flawed, account access blocker)
- Medium (e.g. store listing temporarily unavailable, standard production progress inquiry)
- Low (e.g. routine author bio updates, general questions)

Respond strictly in valid JSON format:
{{
  "category": "<chosen category>",
  "priority": "<chosen priority>",
  "reasoning": "<1-2 sentence explanation>"
}}
"""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a support classification classifier for BookLeaf Publishing."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=200
        )
        data = json.loads(response.choices[0].message.content)
        cat = data.get("category", "General Inquiry")
        if cat not in VALID_CATEGORIES:
            cat = "General Inquiry"
        prio = data.get("priority", "Medium")
        if prio not in VALID_PRIORITIES:
            prio = "Medium"
        return cat, prio, data.get("reasoning", "AI classification based on ticket content.")

    def _heuristic_classify(
        self, subject: str, description: str, book_info: Optional[Dict[str, Any]]
    ) -> Tuple[str, str, str]:
        text = f"{subject} {description}".lower()
        
        # Category detection
        if any(w in text for w in ["royalt", "payout", "payment", "bank", "sold", "money", "earned", "commission", "profit", "threshold"]):
            category = "Royalty & Payments"
            if any(w in text for w in ["haven't received", "havent received", "never received", "6 month", "4 month", "not paid", "missing payment", "overdue"]):
                priority = "High"
                reasoning = "Unpaid or delayed royalties query flagged for urgent financial review."
            elif any(w in text for w in ["too low", "discrepancy", "calculation", "sold 200", "breakdown"]):
                priority = "Medium"
                reasoning = "Royalty calculation inquiry requiring detailed sales breakdown explanation."
            else:
                priority = "Medium"
                reasoning = "General royalty inquiry."
        elif any(w in text for w in ["isbn", "barcode", "imprint", "wrong book"]):
            category = "ISBN & Metadata Issues"
            priority = "High"
            reasoning = "ISBN discrepancies affect live distribution and store metadata directly."
        elif any(w in text for w in ["print", "paper", "cover page", "binding", "blurry", "misprint", "damaged", "terrible", "smudge"]):
            category = "Printing & Quality"
            priority = "High" if any(w in text for w in ["terrible", "damaged", "misaligned", "unusable"]) else "Medium"
            reasoning = "Print quality issue; author copy inspection & potential reprint verification required."
        elif any(w in text for w in ["unavailable", "out of stock", "amazon", "flipkart", "store", "listing", "not showing"]):
            category = "Distribution & Availability"
            priority = "Medium"
            reasoning = "Storefront availability or channel stock sync delay inquiry."
        elif any(w in text for w in ["typesetting", "proof", "proofreading", "stage", "status", "production", "weeks", "when will it"]):
            category = "Book Status & Production Updates"
            priority = "Medium"
            reasoning = "Production pipeline progression query requiring milestone status check."
        else:
            category = "General Inquiry"
            priority = "Low"
            reasoning = "General account or metadata update inquiry."

        return category, priority, reasoning

    async def _openai_draft(
        self,
        author_name: str,
        subject: str,
        description: str,
        category: str,
        priority: str,
        book_info: Optional[Dict[str, Any]],
        custom_instructions: Optional[str]
    ) -> Dict[str, Any]:
        kb_slice = self._select_relevant_kb(category)
        
        book_details_str = "None specified / General Account Query"
        if book_info:
            book_details_str = (
                f"Title: {book_info.get('title')}, Status: {book_info.get('status')}, "
                f"MRP: ₹{book_info.get('mrp', 'N/A')}, Sold: {book_info.get('total_copies_sold', 0)}, "
                f"Royalty Earned: ₹{book_info.get('total_royalty_earned', 0)}, "
                f"Royalty Paid: ₹{book_info.get('royalty_paid', 0)}, "
                f"Royalty Pending: ₹{book_info.get('royalty_pending', 0)}, "
                f"Last Payout Date: {book_info.get('last_royalty_payout_date', 'None')}, "
                f"Print Partner: {book_info.get('print_partner', 'In-House')}"
            )

        system_prompt = f"""You are an expert customer success specialist at BookLeaf Publishing.
Draft an empathetic, precise, and professional response to the author.
Strict BookLeaf Communication Rules:
1. Treat authors as creative partners, never corporate tickets.
2. Acknowledge and validate their concern upfront.
3. Be specific: cite actual numbers, book titles, dates, and amounts from their context.
4. Own mistakes directly if BookLeaf caused an issue; never offer vague corporate deflections.
5. If escalation is required, state a concrete resolution timeline (e.g., 'within 48 hours').
6. Conclude with a clear next step for both author and BookLeaf.
7. Tone: Warm, respectful, transparent, professional.

Relevant BookLeaf Knowledge Base Excerpt:
{kb_slice}

Author Details:
Author Name: {author_name}
Book Context: {book_details_str}
Category: {category}
Priority: {priority}
Additional Admin Instructions: {custom_instructions or 'None'}
"""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Subject: {subject}\nAuthor Query: {description}"}
            ],
            temperature=0.4,
            max_tokens=500
        )
        content = response.choices[0].message.content.strip()
        return {
            "draft_response": content,
            "suggested_category": category,
            "suggested_priority": priority,
            "reasoning": "OpenAI drafted response adhering to BookLeaf tone guidelines and KB context.",
            "confidence": 0.95
        }

    def _heuristic_draft(
        self,
        author_name: str,
        subject: str,
        description: str,
        category: str,
        priority: str,
        book_info: Optional[Dict[str, Any]],
        custom_instructions: Optional[str]
    ) -> Dict[str, Any]:
        text = f"{subject} {description}".lower()
        title = book_info.get("title") if book_info else "your book"
        sold = book_info.get("total_copies_sold", 0) if book_info else 0
        earned = book_info.get("total_royalty_earned", 0) if book_info else 0
        paid = book_info.get("royalty_paid", 0) if book_info else 0
        pending = book_info.get("royalty_pending", 0) if book_info else 0
        last_payout = book_info.get("last_royalty_payout_date") if book_info else None
        status = book_info.get("status") if book_info else "Published & Live"

        # 1. Royalty & Payments
        if category == "Royalty & Payments":
            if "haven't received" in text or "not received" in text or "when" in text or pending > 0:
                draft = (
                    f"Dear {author_name},\n\n"
                    f"Thank you for reaching out to us. I completely understand how concerning it is to wait for your royalty payouts, "
                    f"especially after all the hard work that went into '{title}'.\n\n"
                    f"At BookLeaf Publishing, royalties are calculated quarterly and disbursed within 45 days of the quarter ending. "
                    f"Looking at your records for '{title}', you have accumulated ₹{pending:,.2f} in pending royalties (out of ₹{earned:,.2f} total earned across {sold} copies sold, with ₹{paid:,.2f} previously disbursed). "
                    f"Please verify that your bank account information is updated and linked in your author dashboard.\n\n"
                    f"I have personally escalated your payout status to our finance operations desk for an expedited review. "
                    f"Our finance team will verify the transfer batch and provide you with the exact disbursement confirmation within 48 hours.\n\n"
                    f"Next step: Please check your dashboard bank details, and I will update you directly here as soon as our finance team confirms the status.\n\n"
                    f"Warm regards,\n"
                    f"BookLeaf Author Support Team"
                )
            else:
                draft = (
                    f"Dear {author_name},\n\n"
                    f"Thank you for writing to us regarding the royalty figures for '{title}'. We completely appreciate you wanting clarity on how your earnings are calculated.\n\n"
                    f"BookLeaf operates on an 80/20 royalty split, where 80% of the net profit goes directly to you. Net profit is calculated as the book's MRP minus print production costs, platform commission (e.g. Amazon / Flipkart ~15-20%), and applicable shipping charges.\n\n"
                    f"According to our records, '{title}' has sold {sold} copies with a cumulative earning of ₹{earned:,.2f}. We never want you to feel in the dark about your sales—I have requested a detailed line-by-line platform breakdown from our distribution ledger, which I will share with you right here within 48 hours.\n\n"
                    f"Next step: We will attach the itemized sales report for your review shortly.\n\n"
                    f"Warm regards,\n"
                    f"BookLeaf Author Support Team"
                )

        # 2. ISBN & Metadata
        elif category == "ISBN & Metadata Issues":
            draft = (
                f"Dear {author_name},\n\n"
                f"Thank you for alerting us about the ISBN discrepancy for '{title}'. We treat metadata and catalog integrity with the highest priority, and I sincerely apologize for the inconvenience this has caused.\n\n"
                f"Every book published through BookLeaf receives an exclusive ISBN registered under our imprint. A mismatch between physical copies and online listings can cause confusion for readers, so I have immediately escalated this to our Senior Production Manager.\n\n"
                f"Our catalog operations team is actively auditing the National ISBN Agency records and retailer feeds (Amazon, Flipkart) to correct the mapping. We will have this resolved and provide you with confirmation within 48 hours.\n\n"
                f"Next step: No further action is required from your side. We will notify you as soon as the platform feeds update.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Team"
            )

        # 3. Printing & Quality
        elif category == "Printing & Quality":
            draft = (
                f"Dear {author_name},\n\n"
                f"I am truly sorry to hear that the print quality of your author copies for '{title}' did not meet the high standard you expect and deserve from BookLeaf. We want you to feel immense pride when holding your published work.\n\n"
                f"Under BookLeaf's Quality Guarantee Policy, if any copies suffer from misprints, binding defects, or color discrepancies, we will arrange a 100% free reprint immediately after verification.\n\n"
                f"Could you please reply with 2-3 clear photographs showing the affected pages or binding defects? As soon as our printing manager verifies the defect, we will re-queue the print order at our in-house Delhi printing facility with an expedited turnaround of 5–7 business days.\n\n"
                f"Next step: Please share photos of the defective copies, and we will initiate the replacement reprint order right away.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Team"
            )

        # 4. Distribution & Availability
        elif category == "Distribution & Availability":
            draft = (
                f"Dear {author_name},\n\n"
                f"Thank you for contacting us about the listing availability for '{title}'. Seeing your book marked as 'Currently Unavailable' or out of stock is naturally frustrating, but please rest assured that this is a routine catalog stock sync delay.\n\n"
                f"Our automated feed with Amazon and Flipkart periodically requires a catalog handshake re-sync. I have already triggered an express feed synchronization with our distribution partners.\n\n"
                f"New inventory counts will propagate across the retailer databases, and the listing will show active and purchasable again within 24 to 48 hours.\n\n"
                f"Next step: Our team will monitor the Amazon and Flipkart product pages and confirm once the live status is restored.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Team"
            )

        # 5. Book Status & Production Updates
        elif category == "Book Status & Production Updates":
            current_stage = status if status else "In Production"
            draft = (
                f"Dear {author_name},\n\n"
                f"Thank you for checking in on the progress of '{title}'. We are excited about bringing your book to life and appreciate your patience as we work through the craft of book production.\n\n"
                f"Your book is currently in the '{current_stage}' stage of our 9-step production pipeline. To ensure the highest publication quality, our typesetters and design specialists are carefully reviewing formatting and layout consistency.\n\n"
                f"Our team is scheduled to finalize this stage within the next 3 business days, following which you will receive the digital proof directly for your review and sign-off.\n\n"
                f"Next step: Keep an eye out for our upcoming email with your digital proof for approval.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Team"
            )

        # 6. General Inquiry
        else:
            draft = (
                f"Dear {author_name},\n\n"
                f"Thank you for reaching out to BookLeaf Publishing regarding '{title}'. We are always delighted to assist our authors with any questions about their publishing journey.\n\n"
                f"Regarding your query, you can submit author biography updates, book description revisions, or pricing changes anytime. Metadata updates submitted to retail partners typically reflect on platforms like Amazon and Flipkart within 3–5 business days.\n\n"
                f"Next step: Please let us know if you would like us to apply specific text modifications to your listing, and our operations team will gladly process them for you.\n\n"
                f"Warm regards,\n"
                f"BookLeaf Author Support Team"
            )

        if custom_instructions:
            draft += f"\n\n[Note from Support: {custom_instructions}]"

        return {
            "draft_response": draft,
            "suggested_category": category,
            "suggested_priority": priority,
            "reasoning": f"Knowledge Base response generated with tone guidelines and author metadata for '{title}'.",
            "confidence": 0.90
        }

ai_service = AIService()
