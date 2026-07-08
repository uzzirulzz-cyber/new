import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, generateTxId } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/admin/actions — perform admin action on a user
// Actions: ADD_FUNDS, DEDUCT_FUNDS, FREEZE_FUNDS, UNFREEZE_FUNDS,
//          APPROVE_USER, REJECT_USER, BAN_USER, UNBAN_USER,
//          SUSPEND_USER, ACTIVATE_USER, RESET_PASSWORD,
//          APPROVE_DEPOSIT, REJECT_DEPOSIT, APPROVE_WITHDRAWAL, REJECT_WITHDRAWAL,
//          SEND_NOTIFICATION
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const { action, targetUserId, amount, note, transactionId, title, message } = await req.json();

    if (!action) return NextResponse.json({ error: "action required" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // ─── User-targeted actions ─────────────────────────────────
    if (targetUserId) {
      const target = await db.user.findUnique({
        where: { id: targetUserId },
        include: { wallet: true },
      });
      if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

      switch (action) {
        case "ADD_FUNDS": {
          if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
          await db.wallet.update({
            where: { userId: targetUserId },
            data: { available: { increment: amount } },
          });
          await db.transaction.create({
            data: {
              txId: generateTxId("TXN"),
              userId: targetUserId,
              type: "ADMIN_CREDIT",
              amount,
              status: "SUCCESSFUL",
              note: note || `Admin credit by ${admin.name}`,
            },
          });
          await db.notification.create({
            data: {
              userId: targetUserId,
              title: "Funds Added",
              message: `$${amount.toFixed(2)} has been credited to your account by admin.`,
              type: "success",
            },
          });
          break;
        }
        case "DEDUCT_FUNDS": {
          if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
          if (!target.wallet || target.wallet.available < amount) {
            return NextResponse.json({ error: "Insufficient user balance" }, { status: 400 });
          }
          await db.wallet.update({
            where: { userId: targetUserId },
            data: { available: { decrement: amount } },
          });
          await db.transaction.create({
            data: {
              txId: generateTxId("TXN"),
              userId: targetUserId,
              type: "ADMIN_DEBIT",
              amount,
              status: "SUCCESSFUL",
              note: note || `Admin debit by ${admin.name}`,
            },
          });
          break;
        }
        case "FREEZE_FUNDS": {
          if (!target.wallet) return NextResponse.json({ error: "No wallet" }, { status: 404 });
          const frozen = target.wallet.available;
          await db.wallet.update({
            where: { userId: targetUserId },
            data: { available: 0, frozen: { increment: frozen } },
          });
          await db.notification.create({
            data: {
              userId: targetUserId,
              title: "Funds Frozen",
              message: `Your available funds ($${frozen.toFixed(2)}) have been frozen by admin. Contact support for details.`,
              type: "warning",
            },
          });
          break;
        }
        case "UNFREEZE_FUNDS": {
          if (!target.wallet) return NextResponse.json({ error: "No wallet" }, { status: 404 });
          const unfrozen = target.wallet.frozen;
          await db.wallet.update({
            where: { userId: targetUserId },
            data: { available: { increment: unfrozen }, frozen: 0 },
          });
          break;
        }
        case "APPROVE_USER":
          await db.user.update({
            where: { id: targetUserId },
            data: { status: "ACTIVE", kycStatus: "VERIFIED" },
          });
          await db.notification.create({
            data: {
              userId: targetUserId,
              title: "Account Approved",
              message: "Your account has been approved. You can now trade on BlockExchange.buzz.",
              type: "success",
            },
          });
          break;
        case "REJECT_USER":
          await db.user.update({
            where: { id: targetUserId },
            data: { status: "SUSPENDED", kycStatus: "REJECTED" },
          });
          break;
        case "BAN_USER":
          await db.user.update({ where: { id: targetUserId }, data: { status: "BANNED" } });
          break;
        case "UNBAN_USER":
          await db.user.update({ where: { id: targetUserId }, data: { status: "ACTIVE" } });
          break;
        case "SUSPEND_USER":
          await db.user.update({ where: { id: targetUserId }, data: { status: "SUSPENDED" } });
          break;
        case "ACTIVATE_USER":
          await db.user.update({ where: { id: targetUserId }, data: { status: "ACTIVE" } });
          break;
        case "SEND_NOTIFICATION": {
          if (!title || !message) return NextResponse.json({ error: "title and message required" }, { status: 400 });
          await db.notification.create({
            data: {
              userId: targetUserId,
              title,
              message,
              type: "info",
            },
          });
          break;
        }
        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
      }

      // ─── Audit log ──────────────────────────────────────────
      await db.auditLog.create({
        data: {
          adminId: admin.id,
          action,
          targetType: "user",
          targetId: targetUserId,
          details: JSON.stringify({ amount, note }),
          ip,
        },
      });

      return NextResponse.json({ success: true, action, targetUserId });
    }

    // ─── Transaction-targeted actions (deposit/withdrawal approval) ──
    if (transactionId) {
      const tx = await db.transaction.findUnique({
        where: { id: transactionId },
        include: { user: { include: { wallet: true } } },
      });
      if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

      switch (action) {
        case "APPROVE_DEPOSIT": {
          if (tx.type !== "DEPOSIT" || tx.status !== "PENDING") {
            return NextResponse.json({ error: "Invalid transaction" }, { status: 400 });
          }
          await db.$transaction([
            db.transaction.update({
              where: { id: transactionId },
              data: { status: "SUCCESSFUL", processedAt: new Date(), adminNote: note },
            }),
            db.wallet.update({
              where: { userId: tx.userId },
              data: { available: { increment: tx.amount } },
            }),
          ]);
          await db.notification.create({
            data: {
              userId: tx.userId,
              title: "Deposit Approved",
              message: `Your deposit of $${tx.amount.toFixed(2)} has been approved and credited to your wallet.`,
              type: "success",
            },
          });
          break;
        }
        case "REJECT_DEPOSIT": {
          await db.transaction.update({
            where: { id: transactionId },
            data: { status: "FAILED", processedAt: new Date(), adminNote: note },
          });
          await db.notification.create({
            data: {
              userId: tx.userId,
              title: "Deposit Rejected",
              message: `Your deposit request of $${tx.amount.toFixed(2)} has been rejected. ${note || ""}`,
              type: "warning",
            },
          });
          break;
        }
        case "APPROVE_WITHDRAWAL": {
          if (tx.type !== "WITHDRAWAL" || tx.status !== "PENDING") {
            return NextResponse.json({ error: "Invalid transaction" }, { status: 400 });
          }
          // Deduct from frozen (funds were locked when request was made)
          await db.$transaction([
            db.transaction.update({
              where: { id: transactionId },
              data: { status: "SUCCESSFUL", processedAt: new Date(), adminNote: note },
            }),
            db.wallet.update({
              where: { userId: tx.userId },
              data: { frozen: { decrement: tx.amount + tx.fee } },
            }),
          ]);
          await db.notification.create({
            data: {
              userId: tx.userId,
              title: "Withdrawal Approved",
              message: `Your withdrawal of $${tx.amount.toFixed(2)} has been approved and sent to your destination.`,
              type: "success",
            },
          });
          break;
        }
        case "REJECT_WITHDRAWAL": {
          // Refund the frozen funds
          await db.$transaction([
            db.transaction.update({
              where: { id: transactionId },
              data: { status: "CANCELLED", processedAt: new Date(), adminNote: note },
            }),
            db.wallet.update({
              where: { userId: tx.userId },
              data: {
                frozen: { decrement: tx.amount + tx.fee },
                available: { increment: tx.amount + tx.fee },
              },
            }),
          ]);
          await db.notification.create({
            data: {
              userId: tx.userId,
              title: "Withdrawal Rejected",
              message: `Your withdrawal of $${tx.amount.toFixed(2)} was rejected. Funds returned to your balance. ${note || ""}`,
              type: "warning",
            },
          });
          break;
        }
        default:
          return NextResponse.json({ error: `Unknown transaction action: ${action}` }, { status: 400 });
      }

      await db.auditLog.create({
        data: {
          adminId: admin.id,
          action,
          targetType: "transaction",
          targetId: transactionId,
          details: JSON.stringify({ txId: tx.txId, note }),
          ip,
        },
      });

      return NextResponse.json({ success: true, action, transactionId });
    }

    return NextResponse.json({ error: "targetUserId or transactionId required" }, { status: 400 });
  } catch (e: any) {
    console.error("Admin action error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
