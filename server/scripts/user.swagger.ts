export const userTags = [
  {
    name: "User",
    description: "Operations related to user registration, login, profile, etc.",
  },
];

export const userSchemas = {
  RegisterInitiateInput: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "John Doe" },
      email: { type: "string", example: "john@example.com" },
      password: { type: "string", example: "StrongPassword123" },
      role: {
        type: "string",
        enum: ["super_admin", "mentor", "student", "org_admin"],
        example: "student",
      },
      organization: { type: "string", example: "60dbf4e2f65d2c3efb5b4a5e" },
    },
  },

  RegisterCompleteInput: {
    type: "object",
    required: ["otp", "email", "password"],
    properties: {
      otp: { type: "string", example: "123456" },
      email: { type: "string", example: "john@example.com" },
      password: { type: "string", example: "StrongPassword123" },
    },
  },

  LoginInput: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", example: "john@example.com" },
      password: { type: "string", example: "StrongPassword123" },
    },
  },

  UpdateProfileInput: {
    type: "object",
    required: ["name", "profile"],
    properties: {
      name: { type: "string", example: "John Updated" },
      profile: {
        type: "object",
        properties: {
          bio: { type: "string", example: "MERN Stack Developer" },
          xp: { type: "number", example: 100 },
          streak: { type: "number", example: 10 },
          skills: {
            type: "array",
            items: { type: "string" },
            example: ["typescript", "react", "node"],
          },
        },
      },
    },
  },
};
