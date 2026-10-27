from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.database import get_database
from app.services.auth_service import get_current_admin
from app.schemas.ticket import TicketResponse
from app.routers.tickets import format_ticket

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

PRIORITY_WEIGHTS = {
    "Critical": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1
}

@router.get("/queue", response_model=List[TicketResponse])
async def get_ticket_queue(
    status: Optional[str] = Query(None, description="Filter by status: Open, In Progress, Resolved, Closed"),
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority: Critical, High, Medium, Low"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned admin email"),
    search: Optional[str] = Query(None, description="Search by subject, description, author name, or ticket #"),
    sort_by: Optional[str] = Query("urgency", description="urgency, oldest, newest"),
    date_filter: Optional[str] = Query(None, description="Filter by date: All, Today, Last 7 Days, Last 30 Days"),
    admin_user: dict = Depends(get_current_admin)
):
    db = get_database()
    query = {}

    if status and status != "All":
        query["status"] = status
    if category and category != "All":
        query["category"] = category
    if priority and priority != "All":
        query["priority"] = priority
    if assigned_to:
        if assigned_to == "unassigned":
            query["assigned_to"] = None
        elif assigned_to != "All":
            query["assigned_to"] = assigned_to

    if date_filter and date_filter != "All":
        from datetime import timedelta
        now = datetime.utcnow()
        if date_filter == "Today":
            start_of_today = datetime(now.year, now.month, now.day)
            query["created_at"] = {"$gte": start_of_today}
        elif date_filter == "Last 7 Days":
            query["created_at"] = {"$gte": now - timedelta(days=7)}
        elif date_filter == "Last 30 Days":
            query["created_at"] = {"$gte": now - timedelta(days=30)}

    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"ticket_number": search_regex},
            {"subject": search_regex},
            {"description": search_regex},
            {"author_name": search_regex},
            {"author_email": search_regex},
            {"book_title": search_regex}
        ]

    cursor = db.tickets.find(query)
    raw_tickets = []
    async for doc in cursor:
        raw_tickets.append(format_ticket(doc, is_admin=True))

    # Smart sorting
    if sort_by == "urgency":
        # Urgent & oldest unresolved tickets should be easy to spot (per PDF spec!)
        def sort_key(t):
            prio_val = PRIORITY_WEIGHTS.get(t.get("priority", "Low"), 0)
            is_open = 1 if t.get("status") in ["Open", "In Progress"] else 0
            created = t.get("created_at")
            timestamp = created.timestamp() if isinstance(created, datetime) else 0
            # Higher priority and open status comes first, then older timestamps first
            return (-is_open, -prio_val, timestamp)
        
        raw_tickets.sort(key=sort_key)
    elif sort_by == "oldest":
        raw_tickets.sort(key=lambda t: t.get("created_at") or datetime.min)
    elif sort_by == "newest":
        raw_tickets.sort(key=lambda t: t.get("created_at") or datetime.min, reverse=True)

    return [TicketResponse(**t) for t in raw_tickets]

@router.get("/stats")
async def get_admin_dashboard_stats(admin_user: dict = Depends(get_current_admin)):
    db = get_database()
    
    total_tickets = await db.tickets.count_documents({})
    open_tickets = await db.tickets.count_documents({"status": "Open"})
    in_progress = await db.tickets.count_documents({"status": "In Progress"})
    resolved = await db.tickets.count_documents({"status": "Resolved"})
    closed = await db.tickets.count_documents({"status": "Closed"})
    
    critical_tickets = await db.tickets.count_documents({"priority": "Critical", "status": {"$in": ["Open", "In Progress"]}})
    high_priority = await db.tickets.count_documents({"priority": "High", "status": {"$in": ["Open", "In Progress"]}})
    
    # Category aggregation
    cat_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    cat_results = await db.tickets.aggregate(cat_pipeline).to_list(100)
    category_counts = {item["_id"] or "Uncategorized": item["count"] for item in cat_results}

    # Royalty totals across catalog
    royalty_pipeline = [
        {
            "$group": {
                "_id": None,
                "total_earned": {"$sum": "$total_royalty_earned"},
                "total_paid": {"$sum": "$royalty_paid"},
                "total_pending": {"$sum": "$royalty_pending"},
                "total_books": {"$sum": 1},
                "total_copies_sold": {"$sum": "$total_copies_sold"}
            }
        }
    ]
    royalty_stats = await db.books.aggregate(royalty_pipeline).to_list(1)
    royalty_summary = royalty_stats[0] if royalty_stats else {
        "total_earned": 0, "total_paid": 0, "total_pending": 0, "total_books": 0, "total_copies_sold": 0
    }

    authors_count = await db.authors.count_documents({})

    return {
        "tickets": {
            "total": total_tickets,
            "open": open_tickets,
            "in_progress": in_progress,
            "resolved": resolved,
            "closed": closed,
            "critical_pending": critical_tickets,
            "high_pending": high_priority,
            "unresolved": open_tickets + in_progress
        },
        "categories": category_counts,
        "catalog": {
            "total_authors": authors_count,
            "total_books": royalty_summary.get("total_books", 0),
            "total_copies_sold": royalty_summary.get("total_copies_sold", 0),
            "total_royalty_earned": royalty_summary.get("total_earned", 0),
            "total_royalty_paid": royalty_summary.get("total_paid", 0),
            "total_royalty_pending": royalty_summary.get("total_pending", 0)
        }
    }
