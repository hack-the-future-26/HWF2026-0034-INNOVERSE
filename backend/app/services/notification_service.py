from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Notification, QueueEntry, User
from app.websocket.events import notify_queue_event_sync, QueueEvents

class NotificationChannel:
    """Abstract base class for notification dispatchers (In-App, Browser Push, SMS)."""
    def send(self, user_id: int, message: str, metadata: Optional[Dict[str, Any]] = None):
        raise NotImplementedError

class InAppNotificationChannel(NotificationChannel):
    """In-App DB & WebSocket Notification Channel."""
    def send(self, user_id: int, message: str, metadata: Optional[Dict[str, Any]] = None):
        pass

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        message: str,
        queue_entry_id: Optional[int] = None,
        n_type: str = "info"
    ) -> Notification:
        """
        Creates an in-app notification record and broadcasts via WebSocket.
        Structured to easily attach SMS/Browser Push adapters in the future.
        """
        notif = Notification(
            user_id=user_id,
            queue_entry_id=queue_entry_id,
            message=message,
            type=n_type,
            is_read=False
        )
        db.add(notif)
        db.flush()

        # Trigger WebSocket event for real-time notification badge/toast updates
        if queue_entry_id:
            entry = db.query(QueueEntry).filter(QueueEntry.id == queue_entry_id).first()
            if entry and entry.queue_id:
                notify_queue_event_sync(
                    db,
                    entry.queue_id,
                    QueueEvents.NOTIFICATION,
                    {
                        "notification_id": notif.id,
                        "user_id": user_id,
                        "message": message,
                        "type": n_type
                    }
                )

        return notif

    @staticmethod
    def trigger_joined_notification(db: Session, user_id: int, token_number: str, queue_entry_id: int) -> Notification:
        """Exact Trigger: 'You're successfully added to the queue. Your token is A-104.'"""
        message = f"You're successfully added to the queue. Your token is {token_number}."
        return NotificationService.create_notification(db, user_id, message, queue_entry_id, "queue_joined")

    @staticmethod
    def trigger_position_notification(db: Session, user_id: int, position: int, queue_entry_id: int) -> Optional[Notification]:
        """
        Exact Triggers:
        - 5 positions away (people_ahead == 5, position == 6): "You're 5 positions away. Please prepare to arrive."
        - 1 position away (people_ahead == 1, position == 2): "You're next. Please proceed to the service area."
        """
        people_ahead = position - 1
        if people_ahead == 5:
            message = "You're 5 positions away. Please prepare to arrive."
            return NotificationService.create_notification(db, user_id, message, queue_entry_id, "position_alert_5")
        elif people_ahead == 1:
            message = "You're next. Please proceed to the service area."
            return NotificationService.create_notification(db, user_id, message, queue_entry_id, "position_alert_1")
        return None

    @staticmethod
    def trigger_called_notification(db: Session, user_id: int, counter_name: str, queue_entry_id: int) -> Notification:
        """Exact Trigger: 'It's your turn! Please proceed to Counter 2.'"""
        message = f"It's your turn! Please proceed to {counter_name}."
        return NotificationService.create_notification(db, user_id, message, queue_entry_id, "token_called")

    @staticmethod
    def trigger_cancelled_notification(db: Session, user_id: int, queue_entry_id: int) -> Notification:
        """Exact Trigger: 'Your queue entry has been cancelled.'"""
        message = "Your queue entry has been cancelled."
        return NotificationService.create_notification(db, user_id, message, queue_entry_id, "queue_cancelled")
