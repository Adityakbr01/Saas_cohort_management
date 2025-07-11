import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "../docs/swagger.json";




import { env_config } from "./configs/env";


//middlewares
import errorHandler from "@/middleware/errorHandler";
import notFound from "@/middleware/notFound";

// import userRouter from "@/routes/userRoutes";
import orgRouter from "@/routes/orgRoutes";
import subscriptionRouter from "@/routes/subscriptionRoute";
import paymentRouter from "./routes/paymentRoutes";
// import studentRouter from "@/routes/studentRouter";
import authRoutes from "@/routes/auth.routes";
import chapterRoutes from "@/routes/chapter.routes";
import cohortRoutes from "@/routes/cohort.routes";
import lessonRoutes from "@/routes/lessons.routes";
import mentorRouter from "@/routes/mentorRoutes";


const app = express();


// Middleware
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.disable("x-powered-by");

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
    origin: env_config.CORS_ORIGIN || process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    maxAge: 86400,
  })
);


app.use(cookieParser());

//Todo --> add karna hai 
// app.use(compression())

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
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ Health Check
app.get("/", (_, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// ✅ Routes

// app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/payments", paymentRouter)
app.use("/api/v1/org", orgRouter);

// app.use("/api/v1/students", studentRouter);
app.use("/api/v1/mentors", mentorRouter);

//New Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cohorts", cohortRoutes)
app.use("/api/v1/chapters", chapterRoutes);
app.use("/api/v1/lessons", lessonRoutes);



// ✅ Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
