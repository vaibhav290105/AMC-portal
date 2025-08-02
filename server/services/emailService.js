import nodemailer from "nodemailer";
import cron from "node-cron";
import { prisma } from "../index.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: "vaibhavgupta290105@gmail.com",
    pass: "wsqltcfyxvunnmxy",
  },
});

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// ✅ Check for expiring AMC contracts and send reminders
export const checkExpiringContracts = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sixMonthsFromToday = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());

    // AMC ending within 6 months
    const expiringSoon = await prisma.amcContract.findMany({
      where: {
        amcEnd: {
          gte: today,
          lte: sixMonthsFromToday,
        },
      },
      include: {
        owner: true,
      },
    });

    // AMC already expired
    const alreadyExpired = await prisma.amcContract.findMany({
      where: {
        amcEnd: {
          lt: today,
        },
      },
      include: {
        owner: true,
      },
    });

    const contracts = [
      ...expiringSoon.map(contract => ({ contract, type: 'expiringSoon' })),
      ...alreadyExpired.map(contract => ({ contract, type: 'expired' })),
    ];

    for (const { contract, type } of contracts) {
      if (contract.owner.emailPreference) {
        const subject =
          type === 'expiringSoon'
            ? `AMC Renewal Reminder - ${contract.assetNumber}`
            : `Expired AMC Contract - ${contract.assetNumber}`;

        const html = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);">
  <h2 style="color: #1d4ed8; font-size: 24px; margin-bottom: 16px;">🔔 ${
    type === 'expired' ? 'Expired AMC Contract' : 'AMC Renewal Reminder'
  }</h2>

  <p style="font-size: 16px; color: #374151; margin: 0 0 12px 0;">Dear <strong>${
    contract.owner.name
  }</strong>,</p>

  <p style="font-size: 15px; color: #4b5563; margin: 0 0 16px 0;">${
    type === 'expired'
      ? 'Your AMC contract has expired and may need renewal:'
      : 'This is a friendly reminder that your AMC contract is nearing its expiration:'
  }</p>

  <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
    <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 18px;">📋 Asset Details:</h3>
    <p style="margin: 6px 0;"><strong>Asset Number:</strong> ${contract.assetNumber}</p>
    <p style="margin: 6px 0;"><strong>Make & Model:</strong> ${contract.make} ${contract.model}</p>
    <p style="margin: 6px 0;"><strong>Location:</strong> ${contract.location}</p>
    <p style="margin: 6px 0;"><strong>AMC End Date:</strong> ${contract.amcEnd.toLocaleDateString()}</p>
    <p style="margin: 6px 0;"><strong>Vendor:</strong> ${contract.vendor}</p>
  </div>

  <p style="font-size: 15px; color: #374151; margin-bottom: 20px;">
    Please take the necessary steps to ${
      type === 'expired' ? 'renew' : 'monitor'
    } your AMC contract ${type === 'expired' ? 'as soon as possible.' : 'before the expiration date.'}
  </p>

  <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Best regards,</p>
  <p style="font-size: 14px; font-weight: bold; color: #1f2937;">IGL AMC Management System</p>

  <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />

  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    &copy; ${new Date().getFullYear()} IGL AMC System. All rights reserved.
  </p>
</div>
        `;

        await sendEmail(contract.owner.email, subject, html);
      }
    }

    console.log(`✅ Sent ${contracts.length} AMC contract reminders`);
  } catch (error) {
    console.error("❌ Error checking AMC contracts:", error);
  }
};

// ✅ Check for expiring purchase orders and send reminders
export const checkExpiringPurchaseOrders = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sixMonthsFromToday = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());

    const expiringSoon = await prisma.purchaseOrder.findMany({
      where: {
        validityEnd: {
          gte: today,
          lte: sixMonthsFromToday,
        },
      },
      include: {
        owner: true,
      },
    });

    const alreadyExpired = await prisma.purchaseOrder.findMany({
      where: {
        validityEnd: {
          lt: today,
        },
      },
      include: {
        owner: true,
      },
    });

    const reminders = [
      ...expiringSoon.map(po => ({ po, type: 'expiringSoon' })),
      ...alreadyExpired.map(po => ({ po, type: 'expired' })),
    ];

    for (const { po, type } of reminders) {
      if (po.owner.poEmailPreference) {
        const subject =
          type === 'expiringSoon'
            ? `Reminder: PO ${po.poNumber} is Expiring Soon`
            : `Action Required: PO ${po.poNumber} has Expired`;

        const html = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);">
  <h2 style="color: #1d4ed8; font-size: 24px; margin-bottom: 16px;">📦 ${
    type === 'expired' ? 'Expired Purchase Order Alert' : 'Purchase Order Expiry Reminder'
  }</h2>

  <p style="font-size: 16px; color: #374151; margin: 0 0 12px 0;">Dear <strong>${po.owner.name}</strong>,</p>

  <p style="font-size: 15px; color: #4b5563; margin: 0 0 16px 0;">
    ${
      type === 'expired'
        ? 'Your Purchase Order has already expired and may require renewal:'
        : 'This is a reminder that your Purchase Order will expire within 6 months:'
    }
  </p>

  <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
    <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 18px;">📋 PO Details:</h3>
    <p style="margin: 6px 0;"><strong>PO Number:</strong> ${po.poNumber}</p>
    <p style="margin: 6px 0;"><strong>Vendor:</strong> ${po.vendorName} (${po.vendorCode})</p>
    <p style="margin: 6px 0;"><strong>PO Date:</strong> ${po.poDate.toLocaleDateString()}</p>
    <p style="margin: 6px 0;"><strong>Validity End:</strong> ${po.validityEnd.toLocaleDateString()}</p>
    <p style="margin: 6px 0;"><strong>Department:</strong> ${po.department}</p>
  </div>

  <p style="font-size: 15px; color: #374151; margin-bottom: 20px;">
    Please take necessary action to ${
      type === 'expired' ? 'renew this PO at the earliest' : 'track the PO before expiry'
    }.
  </p>

  <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Best regards,</p>
  <p style="font-size: 14px; font-weight: bold; color: #1f2937;">IGL AMC Management System</p>

  <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />

  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    &copy; ${new Date().getFullYear()} IGL AMC System. All rights reserved.
  </p>
</div>
        `;

        await sendEmail(po.owner.email, subject, html);
      }
    }

    console.log(`✅ Sent ${reminders.length} purchase order reminder emails.`);
  } catch (error) {
    console.error('❌ Error sending purchase order reminders:', error);
  }
};

// ✅ Email scheduler – Runs every Monday at 9 AM
export const startEmailScheduler = () => {
  cron.schedule("0 9 * * 1", () => {
    console.log("⏰ Running weekly AMC and PO reminder check...");
    checkExpiringContracts();
    checkExpiringPurchaseOrders();
  });

  console.log("📬 Email scheduler started – every Monday at 9 AM");
};
