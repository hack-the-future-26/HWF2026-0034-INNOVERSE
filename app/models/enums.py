import enum

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    STAFF = "staff"
    ADMIN = "admin"

class LocationType(str, enum.Enum):
    HOSPITAL = "hospital"
    BANK = "bank"
    RETAIL = "retail"
    GOVERNMENT = "government"

class QueueEntryStatus(str, enum.Enum):
    WAITING = "WAITING"
    CALLED = "CALLED"
    SERVING = "SERVING"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"
    NO_SHOW = "NO_SHOW"
    CANCELLED = "CANCELLED"
