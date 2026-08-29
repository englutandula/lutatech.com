import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    ForeignKey, Enum as SAEnum, Text, Date
)
from sqlalchemy.orm import relationship
from app.database import Base


class SubscriptionPlan(str, enum.Enum):
    free = "free"
    pro = "pro"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    jobs = relationship("ToolJob", back_populates="user")
    download_limits = relationship("DownloadLimit", back_populates="user")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    plan = Column(SAEnum(SubscriptionPlan), default=SubscriptionPlan.free, nullable=False)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # None = never expires (free)

    user = relationship("User", back_populates="subscription")


class ToolJob(Base):
    __tablename__ = "tool_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for guests
    tool_type = Column(String(50), nullable=False)  # "passport" | "remove-bg"
    status = Column(String(20), default="completed")  # completed | failed
    country_code = Column(String(10), nullable=True)  # for passport tool
    result_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="jobs")


class DownloadLimit(Base):
    __tablename__ = "download_limits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    count = Column(Integer, default=0)

    user = relationship("User", back_populates="download_limits")
