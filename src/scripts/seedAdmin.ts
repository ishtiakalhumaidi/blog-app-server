import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

async function seedAdmin() {
  try {
    console.log("*********** admin seeding started.... ********");
    const adminData = {
      name: "Mr. Admin",
      email: "admin@blog.com",
      role: UserRole.ADMIN,
      password: "admin1234",
      emailVerified: true,
    };
console.log("*********** checking admin exist or not ********");
    // check user exist or not
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });
    if (existingUser) {
      throw new Error("User already exists!");
    }

    const signUpAdmin = await fetch(
      `http://localhost:5000/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(adminData),
      }
    );

    if (signUpAdmin.ok) {
        console.log("*********** admin created ********");
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
      console.log("*********** email verification status updated********");
    }

    console.log("*********** success ********");
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
