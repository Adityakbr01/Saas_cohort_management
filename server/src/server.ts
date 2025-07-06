import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.json";



import { env_config } from "./configs/env";


//middlewares
import notFound from "@/middleware/notFound";
import errorHandler from "@/middleware/errorHandler";
import { swaggerSpec } from "./configs/swagger";

// import userRouter from "@/routes/userRoutes";
import orgRouter from "@/routes/orgRoutes";
import subscriptionRouter from "@/routes/subscriptionRoute";
// import paymentRouter from "./routes/paymentRoutes";
// import studentRouter from "@/routes/studentRouter";
import mentorRouter from "@/routes/mentorRoutes";
import authRoutes from "@/routes/auth.routes";
import cohortRoutes from "@/routes/cohort.routes";


const app = express();


// Middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.disable("x-powered-by");

app.use(compression());

app.use(helmet());
app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes",
  },
});
app.use(limiter);




app.use(
  cors({
    origin:env_config.CORS_ORIGIN || process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    maxAge: 86400,
  })
);


app.use(cookieParser());

// app.use("/api/v1/payments",paymentRouter)

app.use(express.json({ limit: "24kb" }));
app.use(express.urlencoded({ extended: true, limit: "24kb" }));



app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// ✅ API Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ Health Check
app.get("/", (_, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// ✅ Routes

// app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscription", subscriptionRouter);
// app.use("/api/v1/payments",paymentRouter)
app.use("/api/v1/org", orgRouter);

// app.use("/api/v1/students", studentRouter);
app.use("/api/v1/mentors", mentorRouter);

//Todo --> Inka controller serive me splite karna hai
//New Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cohorts",cohortRoutes)



// ✅ Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
