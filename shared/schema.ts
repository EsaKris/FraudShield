import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Photo Recognition Result schema
export const photoResults = pgTable("photo_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageUrl: text("image_url"),
  name: text("name"),
  location: text("location"),
  age: integer("age"),
  gender: text("gender"),
  nationality: text("nationality"),
  socials: jsonb("socials"),
  confidence: integer("confidence"),
  fraudRisk: text("fraud_risk"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertPhotoResultSchema = createInsertSchema(photoResults).omit({
  id: true,
  timestamp: true,
});

export type InsertPhotoResult = z.infer<typeof insertPhotoResultSchema>;
export type PhotoResult = typeof photoResults.$inferSelect;

// Fraud Alert schema
export const fraudAlerts = pgTable("fraud_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  alertType: text("alert_type").notNull(),
  details: text("details").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
  id: true,
  timestamp: true,
});

export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;
export type FraudAlert = typeof fraudAlerts.$inferSelect;

// Activity Log schema
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  details: text("details").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Phishing Email schema
export const phishingEmails = pgTable("phishing_emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  sender: text("sender").notNull(),
  recipient: text("recipient").notNull(),
  content: text("content").notNull(),
  receivedAt: timestamp("received_at").notNull(),
  analyzedAt: timestamp("analyzed_at"),
  phishingScore: integer("phishing_score").notNull(),
  status: text("status").notNull(), // 'Analyzed', 'Pending', 'Quarantined'
});

export const insertPhishingEmailSchema = createInsertSchema(phishingEmails).omit({
  id: true,
  analyzedAt: true,
});

export type InsertPhishingEmail = z.infer<typeof insertPhishingEmailSchema>;
export type PhishingEmail = typeof phishingEmails.$inferSelect & {
  indicators?: PhishingIndicator[];
};

// Phishing Indicator schema
export const phishingIndicators = pgTable("phishing_indicators", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").references(() => phishingEmails.id).notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  confidence: integer("confidence").notNull(),
});

export const insertPhishingIndicatorSchema = createInsertSchema(phishingIndicators).omit({
  id: true,
});

export type InsertPhishingIndicator = z.infer<typeof insertPhishingIndicatorSchema>;
export type PhishingIndicator = typeof phishingIndicators.$inferSelect;

// Phishing indicator type enum
export type PhishingIndicatorType = 
  | 'Suspicious Link' 
  | 'Spoofed Domain' 
  | 'Request for Sensitive Information'
  | 'Suspicious Attachment'
  | 'Impersonation Attempt'
  | 'Urgency or Pressure'
  | 'Grammar Errors'
  | 'Mismatched URLs';
