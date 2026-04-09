import { Router } from "express";
import { adminRouter } from "./adminRoutes";
import { authRouter } from "./authRoutes";
import { campaignRouter } from "./campaignRoutes";
import { campaignUpdateRouter } from "./campaignUpdateRoutes";
import { donationRouter } from "./donationRoutes";
import { paymentRouter } from "./paymentRoutes";
import { transactionRouter } from "./transactionRoutes";
import { transparencyRouter } from "./transparencyRoutes";
import { userRouter } from "./userRoutes";
import { walletRouter } from "./walletRoutes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "সার্ভার সচল আছে",
    data: { service: "hopes-api", timestamp: new Date().toISOString() },
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/wallet", walletRouter);
apiRouter.use("/transactions", transactionRouter);
apiRouter.use("/campaigns", campaignRouter);
apiRouter.use("/campaigns", campaignUpdateRouter);
apiRouter.use("/donations", donationRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/transparency", transparencyRouter);
