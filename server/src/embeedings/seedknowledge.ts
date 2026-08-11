import mongoose from "mongoose";
import { embedText } from "./embeedings.js";
import dotenv from "dotenv";
import { KnowledgeDoc } from "../models/knowledgedoc.model.js";

dotenv.config();

type KnowledgeCategory = "billing" | "technical" | "account" | "general";

interface SeedDoc {
  title: string;
  category: KnowledgeCategory;
  content: string;
}
const docs: SeedDoc[] = [
  {
    title: "Duplicate charges and refunds",
    category: "billing",
    content:
      "If a customer sees two charges for the same subscription in one billing cycle, it's usually caused by a payment retry after a temporary card decline. Confirm the duplicate in the billing dashboard, then issue a refund for the extra charge. Refunds take 3-5 business days to appear on the customer's statement.",
  },
  {
    title: "Cancelling a subscription",
    category: "billing",
    content:
      "Customers can cancel anytime from Account Settings > Subscription > Cancel Plan. Cancellation takes effect at the end of the current billing period; there are no partial refunds for unused time. Access continues until the period ends.",
  },
  {
    title: "Updating payment method",
    category: "billing",
    content:
      "To update a card on file, go to Account Settings > Billing > Payment Methods > Edit. If a card was recently declined, the account may show a 'past due' banner until a new payment method is added and the outstanding invoice is retried.",
  },
  {
    title: "Resetting a forgotten password",
    category: "account",
    content:
      "Customers can reset their password from the login page using 'Forgot Password'. A reset link is emailed and expires after 30 minutes. If the email doesn't arrive, check spam, and confirm the account email is correct - some users have multiple accounts under different emails.",
  },
  {
    title: "Changing account email address",
    category: "account",
    content:
      "Email changes are done in Account Settings > Profile > Email. A verification link is sent to the new address, and the change only takes effect once verified. The old email remains active until verification is complete.",
  },
  {
    title: "Two-factor authentication setup",
    category: "account",
    content:
      "2FA can be enabled in Account Settings > Security > Two-Factor Authentication. We support authenticator apps (Google Authenticator, Authy). SMS-based 2FA is not currently supported. If a customer is locked out after losing their authenticator device, they must verify identity via support before it can be disabled.",
  },
  {
    title: "App crashing or freezing on load",
    category: "technical",
    content:
      "Most load-time crashes are resolved by clearing the app cache (Settings > Storage > Clear Cache on mobile, or a hard refresh/clear browser cache on web) and ensuring the app is updated to the latest version. If the issue persists after that, collect device type, OS version, and app version for escalation.",
  },
  {
    title: "Data not syncing across devices",
    category: "technical",
    content:
      "Sync issues are almost always caused by being logged into different accounts on different devices, or a device being offline during the last sync attempt. Confirm the same email is used everywhere, then trigger a manual sync from Settings > Sync Now.",
  },
  {
    title: "Exporting data",
    category: "technical",
    content:
      "Customers on the Pro plan and above can export their data as CSV from Settings > Data > Export. Exports are generated asynchronously and emailed as a download link within a few minutes. Free plan does not include export access.",
  },
  {
    title: "General response time expectations",
    category: "general",
    content:
      "Standard support response time is within 24 hours on weekdays. Priority/urgent issues (account access, billing errors, data loss) are typically addressed same-day. There is no live chat currently - all support is handled via ticket.",
  },
];

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ticket-triage",
  );
  console.log("Connected to MongoDB, clearing existing knowledge docs...");

  await KnowledgeDoc.deleteMany({});

  for (const doc of docs) {
    const embedding = await embedText(`${doc.title}\n${doc.content}`);
    await KnowledgeDoc.create({ ...doc, embedding });
    console.log(`Embedded and saved: ${doc.title}`);
  }

  console.log(`Done. Seeded ${docs.length} knowledge docs.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
