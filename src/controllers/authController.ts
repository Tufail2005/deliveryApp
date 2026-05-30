import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { sendOtpSchema, verifyOtpSchema } from "../types/types.js";

const JWT_SECRET = process.env.JWT_SECRET!;

// ---  Send OTP ---
export const sendOtp = async (req: Request, res: Response) => {
  const validation = sendOtpSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  const { phone } = validation.data;

  try {
    // TODO: Integrate your actual SMS provider here (Twilio, AWS SNS, Fast2SMS)
    // Example: await twilioClient.verify.v2.services(serviceSid).verifications.create({ to: phone, channel: 'sms' });

    // For development, we will mock the OTP sending
    console.log(`[MOCK SMS] OTP sent to ${phone}: 123456`);

    return res.status(200).json({
      message: "OTP sent successfully",
      phone: phone,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};


// --- Verify OTP & Authenticate ---
export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body; 

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP parameters are required" });
  }

  try {
    // 🚀 PRODUCTION SANITIZATION LOGIC:
    // Extract the last 10 digits of the string to strip out country codes like '+91' or '0'
    // Ensures '9876543210' and '+919876543210' resolve to the exact same database record!
    const sanitizedPhone = phone.replace(/\D/g, "").slice(-10);

    if (sanitizedPhone.length !== 10) {
      return res.status(400).json({ message: "Invalid phone number format. Please provide a 10-digit number." });
    }

    // Development Mock Check: Always bypasses if code matches 123456
    if (otp !== "123456") {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // 1. Fetch user matching their sanitized phone and load their array relation models
    let user = await prisma.user.findUnique({
      where: { phone: sanitizedPhone },
      include: {
        addresses: true, // Satisfies your schema relation property
      },
    });

    let isNewUser = false;

    // 2. Auto-Register if they turn up missing in database rows
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: sanitizedPhone,
          role: "CUSTOMER",
        },
        include: {
          addresses: true, // Keeps typing uniform for the payload down under
        },
      });
      isNewUser = true;
    }

    // 3. Generate secure application access session parameters
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" } // Mobile sessions usually last longer
    );

    // 4. Verification Check: Profile is complete only if they have assigned a Name 
    // AND they have created at least 1 index entry inside your Address table setup
    const hasSavedAddress = user.addresses && user.addresses.length > 0;
    const isProfileComplete = !!(user.name && hasSavedAddress);

    // 5. Send payload back to your Expo application frontend
    return res.status(200).json({
      message: isNewUser ? "Account created successfully" : "Logged in successfully",
      isNewUser: isNewUser,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isProfileComplete: isProfileComplete, // Frontend reads this flag to control routing path directions
      },
      token: token,
    });
  } catch (error) {
    console.error("Verify OTP Pipeline Crash:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// --- Logout ---
export const logout = (req: Request, res: Response) => {
  // In a pure JWT mobile setup, logout is handled client-side by deleting the token from SecureStore.
  // The backend just sends a success response.
  res.json({ message: "Logged out successfully" });
};
