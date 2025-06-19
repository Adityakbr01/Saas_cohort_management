import mongoose from "mongoose";

const pendingInviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: String,
      enum: ["mentor", "student", "admin"],
      default: "mentor",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING_USER", "PENDING_ADMIN", "ACCEPTED", "REJECTED"],
      default: "PENDING_USER",
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // will auto-delete after expiration
    },
  },
  { timestamps: true }
);

export default mongoose.models.PendingInvite ||
  mongoose.model("PendingInvite", pendingInviteSchema);
