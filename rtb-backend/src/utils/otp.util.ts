import { AppDataSource } from "../data-source";
import { Otp } from "../entities/Otp";
const otpRepository = AppDataSource.getRepository(Otp);

export const generateNumericOtp = (length = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export const createOtpForUser = async (
  userId: string,
  expiresInMinutes = 5
): Promise<Otp> => {
  const code = generateNumericOtp(6);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const otp = otpRepository.create({
    userId,
    code,
    expiresAt,
    used: false,
  });

  return otpRepository.save(otp);
};

export const verifyOtpForUser = async (
  userId: string,
  code: string
): Promise<boolean> => {
  const otp = await otpRepository.findOne({
    where: { userId, code, used: false },
    order: { createdAt: "DESC" },
  });

  if (!otp) return false;

  if (otp.expiresAt < new Date()) return false;

  otp.used = true;
  await otpRepository.save(otp);
  return true;
};
