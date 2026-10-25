"""
BookLeaf Knowledge Base & Communication Rules
Source: BookLeaf Publishing Operations Manual
"""

BOOKLEAF_KNOWLEDGE_BASE = {
    "company_overview": {
        "summary": "BookLeaf Publishing is a self-publishing company operating in India and the US.",
        "catalog_size": "22,000+ titles, processing 1,200+ books monthly.",
        "packages": [
            "Standard Free: No upfront cost.",
            "Bestseller Breakthrough: Premium paid package with marketing and distribution add-ons."
        ],
        "services": "Cover design, typesetting, ISBN assignment, printing, distribution, and royalty management.",
        "facilities": "In-house printing facility and warehouse in Delhi. Print partners include Repro India and Epitome Books."
    },
    "royalty_policy": {
        "split": "80/20 royalty split (80% net profit to author, 20% to BookLeaf).",
        "net_profit_formula": "Net Profit = MRP - Printing Cost - Platform Commission (Amazon/Flipkart) - Shipping Charges.",
        "payout_frequency": "Calculated quarterly and disbursed within 45 days following the quarter end.",
        "quarters": [
            "Q1 (Jan-Mar): Disbursed by May 15",
            "Q2 (Apr-Jun): Disbursed by Aug 15",
            "Q3 (Jul-Sep): Disbursed by Nov 15",
            "Q4 (Oct-Dec): Disbursed by Feb 15"
        ],
        "threshold": "Minimum payout threshold is ₹1,000. Balances below ₹1,000 roll over automatically to the subsequent quarter.",
        "payment_method": "Direct bank transfer to the verified account linked in the author's dashboard.",
        "transparency": "Authors can view real-time sales figures and platform breakdowns in their dashboard."
    },
    "isbn_policy": {
        "assignment": "Every book published receives a unique ISBN assigned under BookLeaf's publisher imprint.",
        "custom_imprint": "Authors wishing to retain their personal imprint must acquire their own ISBN independently.",
        "errors": "ISBN mismatches, duplicate numbers, or wrong book associations are treated as HIGH PRIORITY and escalated directly to the production team with a 48-hour resolution SLA."
    },
    "printing_and_quality": {
        "printers": "In-house Delhi plant handles standard runs. Overflow & special formats routed to Repro India or Epitome Books.",
        "turnaround": "Standard turnaround is 5-7 business days from order confirmation.",
        "defect_policy": "In case of misprints, binding flaws, or color inconsistency, BookLeaf provides 100% free reprint after photo verification. Turnaround for reprint is 5-7 business days."
    },
    "distribution_and_availability": {
        "channels": ["Amazon India", "Flipkart", "Amazon US", "Amazon UK", "BookLeaf Store"],
        "launch_sla": "New listings go live within 7-10 business days after publication is finalized.",
        "stock_sync": "If marked 'Currently Unavailable', it indicates a platform feed stock-sync delay. Support triggers an express catalog sync within 24-48 hours."
    },
    "production_stages": [
        "1. Manuscript Received",
        "2. Editing (if opted)",
        "3. Cover Design (requires author review/approval)",
        "4. Typesetting (formatting proofs)",
        "5. Proofreading (revision rounds)",
        "6. ISBN Assignment",
        "7. Printing",
        "8. Distribution Setup",
        "9. Published & Live"
    ],
    "tone_guidelines": [
        "Empathetic & Professional: Authors are our partners, not customers to be managed.",
        "Acknowledge Before Answering: Always validate the author's emotion/concern before offering technical solutions.",
        "Specific Details: Mention exact amounts, dates, book titles, and statuses rather than vague promises.",
        "Direct Accountability: If BookLeaf has caused a delay or discrepancy, own it honestly with zero corporate deflection.",
        "Timelines: Provide concrete turnaround commitments (e.g. 'within 48 hours', '5-7 business days').",
        "Actionable Conclusion: Always finish with a clear next step for the author and the operations team."
    ]
}

SYSTEM_PROMPT_TEMPLATE = """You are BookLeaf Publishing's AI Support Copilot. Your role is to assist the operations team by classifying tickets, setting priority levels, and drafting empathetic, accurate, and professional responses to author queries.

Tone Guidelines:
- Authors are partners, not customers to manage. Be warm, empathetic, and professional.
- Acknowledge their concern/frustration upfront before giving solutions.
- Be concrete: quote exact book titles, royalty amounts, payout dates, and production stages when relevant.
- Own mistakes directly if BookLeaf caused an issue; never use corporate deflection.
- For escalations or investigations, give explicit timelines (e.g., 'within 48 hours').
- Conclude with a clear next step.

Knowledge Base Reference:
{kb_context}

Author & Book Context:
Author Name: {author_name}
Author ID: {author_id}
Referenced Book: {book_details}
"""
