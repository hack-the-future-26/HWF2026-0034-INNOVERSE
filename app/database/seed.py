import random
from datetime import datetime, timedelta
import hashlib

try:
    from passlib.hash import pbkdf2_sha256
    def hash_password(password: str) -> str:
        return pbkdf2_sha256.hash(password)
except ImportError:
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
from app.models import (
    Organization,
    User, UserRole,
    Location, LocationType,
    Service,
    Queue,
    QueueEntry, QueueEntryStatus,
    Counter,
    Notification,
    QueueHistory
)
from app.database.database import SessionLocal, engine, Base

def seed_database():
    print("Re-creating database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Organizations...")
        org_health = Organization(
            name="Metro Health System",
            code="ORG-HEALTH",
            description="Healthcare organization managing hospital networks and outpatient care clinics."
        )
        org_bank = Organization(
            name="Central City Bank",
            code="ORG-BANK",
            description="Financial institution managing retail banking branches and wealth services."
        )
        org_retail = Organization(
            name="Smart Retail Inc.",
            code="ORG-RETAIL",
            description="Retail chain managing tech stores and customer service centers."
        )
        org_gov = Organization(
            name="Citizen Services Dept",
            code="ORG-GOV",
            description="Government department handling public services, passports, and licensing."
        )

        db.add_all([org_health, org_bank, org_retail, org_gov])
        db.commit()

        print("Seeding Users...")
        # 1. Admin & Staff Users
        admin_user = User(
            name="System Administrator",
            email="admin@smartqueue.com",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            organization_id=org_health.id
        )
        staff_hospital = User(
            name="Dr. Sarah Jenkins",
            email="sarah.jenkins@cityhospital.org",
            password_hash=hash_password("staff123"),
            role=UserRole.STAFF,
            organization_id=org_health.id
        )
        staff_bank = User(
            name="Michael Chen",
            email="m.chen@centralbank.com",
            password_hash=hash_password("staff123"),
            role=UserRole.STAFF,
            organization_id=org_bank.id
        )
        staff_retail = User(
            name="Emily Rodriguez",
            email="emily.r@smartretail.com",
            password_hash=hash_password("staff123"),
            role=UserRole.STAFF,
            organization_id=org_retail.id
        )
        staff_gov = User(
            name="David Miller",
            email="d.miller@citizenservice.gov",
            password_hash=hash_password("staff123"),
            role=UserRole.STAFF,
            organization_id=org_gov.id
        )

        # Customer Users
        customer1 = User(
            name="John Doe",
            email="john.doe@example.com",
            password_hash=hash_password("customer123"),
            role=UserRole.CUSTOMER
        )
        customer2 = User(
            name="Jane Smith",
            email="jane.smith@example.com",
            password_hash=hash_password("customer123"),
            role=UserRole.CUSTOMER
        )
        customer3 = User(
            name="Alex Jones",
            email="alex.jones@example.com",
            password_hash=hash_password("customer123"),
            role=UserRole.CUSTOMER
        )
        customer4 = User(
            name="Maria Garcia",
            email="maria.garcia@example.com",
            password_hash=hash_password("customer123"),
            role=UserRole.CUSTOMER
        )

        db.add_all([
            admin_user, staff_hospital, staff_bank, staff_retail, staff_gov,
            customer1, customer2, customer3, customer4
        ])
        db.commit()

        print("Seeding Locations...")
        # 2. Locations
        loc_hospital = Location(
            organization_id=org_health.id,
            name="City Hospital",
            type=LocationType.HOSPITAL,
            address="100 Medical Center Blvd, Metro City",
            latitude=37.7749,
            longitude=-122.4194,
            status="active"
        )
        loc_bank = Location(
            organization_id=org_bank.id,
            name="Central Bank",
            type=LocationType.BANK,
            address="500 Financial Way, Metro City",
            latitude=37.7833,
            longitude=-122.4167,
            status="active"
        )
        loc_retail = Location(
            organization_id=org_retail.id,
            name="Smart Retail Store",
            type=LocationType.RETAIL,
            address="750 Shopping Plaza, Metro City",
            latitude=37.7850,
            longitude=-122.4080,
            status="active"
        )
        loc_gov = Location(
            organization_id=org_gov.id,
            name="Citizen Service Center",
            type=LocationType.GOVERNMENT,
            address="200 Civic Center Dr, Metro City",
            latitude=37.7794,
            longitude=-122.4180,
            status="active"
        )

        db.add_all([loc_hospital, loc_bank, loc_retail, loc_gov])
        db.commit()

        print("Seeding Services...")
        # 3. Services for each location
        services_data = [
            # City Hospital
            (loc_hospital.id, "Emergency Triage", "Immediate health assessment and initial care", 5),
            (loc_hospital.id, "General OPD", "Outpatient consultation and routine checkups", 15),
            (loc_hospital.id, "Radiology & X-Ray", "Diagnostic imaging and scanning services", 20),
            (loc_hospital.id, "Pharmacy", "Prescription fulfillment and medication dispensing", 8),
            # Central Bank
            (loc_bank.id, "Cash Deposit / Withdrawal", "Quick teller transactions and cash services", 6),
            (loc_bank.id, "New Account & Loans", "Personal banking, credit, and mortgage services", 25),
            (loc_bank.id, "Forex & Investments", "Currency exchange and wealth management", 20),
            # Smart Retail Store
            (loc_retail.id, "Customer Support & Returns", "Product exchanges, returns, and complaints", 10),
            (loc_retail.id, "Tech Repair Desk", "Hardware diagnostics, device repairs, and upgrades", 30),
            (loc_retail.id, "Express Checkout", "Quick item checkout and digital payments", 4),
            # Citizen Service Center
            (loc_gov.id, "Passport & Visa Desk", "Passport applications, renewals, and travel visas", 20),
            (loc_gov.id, "Driver License Renewal", "Permit testing and license updates", 12),
            (loc_gov.id, "Property & Tax Registration", "Land registry and civic tax payments", 25)
        ]

        created_services = []
        for loc_id, sname, sdesc, avg_time in services_data:
            srv = Service(
                location_id=loc_id,
                name=sname,
                description=sdesc,
                average_service_time=avg_time,
                status="active"
            )
            db.add(srv)
            created_services.append(srv)
        db.commit()

        print("Seeding Counters...")
        # 4. Counters
        counters_data = [
            (loc_hospital.id, "Triage Desk 1", staff_hospital.id),
            (loc_hospital.id, "OPD Room 102", staff_hospital.id),
            (loc_bank.id, "Teller Window 1", staff_bank.id),
            (loc_bank.id, "Loan Desk A", staff_bank.id),
            (loc_retail.id, "Support Counter 1", staff_retail.id),
            (loc_retail.id, "Tech Bar 1", staff_retail.id),
            (loc_gov.id, "Passport Window 3", staff_gov.id),
            (loc_gov.id, "License Counter 2", staff_gov.id)
        ]
        for loc_id, cname, sid in counters_data:
            cnt = Counter(location_id=loc_id, name=cname, staff_id=sid, status="open")
            db.add(cnt)
        db.commit()

        print("Seeding Queues & Queue Entries...")
        # 5. Queues for each service
        customers = [customer1, customer2, customer3, customer4]
        statuses = [
            QueueEntryStatus.COMPLETED,
            QueueEntryStatus.SERVING,
            QueueEntryStatus.CALLED,
            QueueEntryStatus.WAITING,
            QueueEntryStatus.WAITING,
            QueueEntryStatus.SKIPPED,
            QueueEntryStatus.CANCELLED
        ]

        now = datetime.utcnow()
        for idx, srv in enumerate(created_services):
            q = Queue(
                location_id=srv.location_id,
                service_id=srv.id,
                status="active",
                current_token=7
            )
            db.add(q)
            db.flush()

            # Create sample queue entries for each queue
            for pos in range(1, 8):
                token_str = f"{srv.name[:2].upper()}{pos:03d}"
                st = statuses[(pos - 1) % len(statuses)]
                usr = customers[(pos - 1) % len(customers)]

                joined = now - timedelta(minutes=(8 - pos) * 12)
                called = joined + timedelta(minutes=5) if st in [QueueEntryStatus.CALLED, QueueEntryStatus.SERVING, QueueEntryStatus.COMPLETED] else None
                completed = called + timedelta(minutes=srv.average_service_time) if st == QueueEntryStatus.COMPLETED else None

                entry = QueueEntry(
                    queue_id=q.id,
                    user_id=usr.id if pos <= 4 else None,
                    token_number=token_str,
                    position=pos,
                    status=st,
                    joined_at=joined,
                    called_at=called,
                    completed_at=completed,
                    estimated_wait=pos * srv.average_service_time
                )
                db.add(entry)
                db.flush()

                # Add sample notification for customers
                if usr and st in [QueueEntryStatus.CALLED, QueueEntryStatus.WAITING]:
                    notif = Notification(
                        user_id=usr.id,
                        queue_entry_id=entry.id,
                        message=f"Your token {token_str} for {srv.name} is status: {st.value}.",
                        type="queue_update",
                        is_read=False
                    )
                    db.add(notif)
        db.commit()

        print("Generating Historical Queue Data for ML...")
        # 6. QueueHistory (Dataset for ML prediction)
        # Covering 7 days of the week (0=Mon to 6=Sun) and operating hours (8 to 18)
        histories = []
        for srv in created_services:
            for day in range(7):  # 0: Monday to 6: Sunday
                # Weekend multiplier
                day_multiplier = 0.6 if day in [5, 6] else 1.0

                for hour in range(8, 19):  # 8 AM to 6 PM
                    # Peak hour multiplier (10-12 AM and 2-4 PM)
                    if 10 <= hour <= 12 or 14 <= hour <= 16:
                        hour_multiplier = 1.8
                    elif 8 <= hour <= 9 or 17 <= hour <= 18:
                        hour_multiplier = 0.7
                    else:
                        hour_multiplier = 1.1

                    base_people = random.randint(8, 25)
                    people_count = int(base_people * day_multiplier * hour_multiplier)
                    active_counters = random.randint(2, 5)
                    
                    # Compute realistic wait & service times
                    avg_service_time = round(srv.average_service_time * random.uniform(0.85, 1.25), 2)
                    actual_wait = round((people_count / max(active_counters, 1)) * (avg_service_time * 0.75), 2)
                    
                    cancellations = int(people_count * random.uniform(0.02, 0.10)) if actual_wait > 20 else 0
                    no_shows = int(people_count * random.uniform(0.01, 0.05))

                    hist = QueueHistory(
                        location_id=srv.location_id,
                        service_id=srv.id,
                        hour=hour,
                        day_of_week=day,
                        people_count=people_count,
                        active_counters=active_counters,
                        average_service_time=avg_service_time,
                        actual_wait_time=actual_wait,
                        cancellations=cancellations,
                        no_shows=no_shows,
                        created_at=now - timedelta(days=(7 - day), hours=(18 - hour))
                    )
                    histories.append(hist)

        db.bulk_save_objects(histories)
        db.commit()

        print(f"Successfully seeded {len(histories)} historical queue records for ML prediction!")
        print("Database seed complete!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
