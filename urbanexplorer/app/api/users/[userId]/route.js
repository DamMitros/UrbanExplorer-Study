import { connectToDB } from "../../../../utils/database";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function GET(req, { params }) {
  const { userId } = params;

  try {
    await connectToDB();
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Użytkownik nie znaleziony" }), 
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania profilu:", error);
    return new Response(
      JSON.stringify({ error: "Błąd serwera" }), 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = params.userId;
    const { username, email, currentPassword, newPassword, role } = await request.json();

    await connectToDB();
    const user = await User.findById(userId);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Użytkownik nie znaleziony' }), { status: 404 });
    }

    if (role !== undefined) {
      user.role = role;
      await user.save();
      return new Response(JSON.stringify(user), { status: 200 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe aktualne hasło" }), 
        { status: 401 }
      );
    }

    const existingUser = await User.findOne({
      $or: [
        { username, _id: { $ne: userId } },
        { email, _id: { $ne: userId } }
      ]
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Nazwa użytkownika lub email już zajęte" }), 
        { status: 409 }
      );
    }

    user.username = username;
    user.email = email;

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return new Response(JSON.stringify(userResponse), { status: 200 });
  } catch (error) {
    console.error("Błąd podczas aktualizacji profilu:", error);
    return new Response(
      JSON.stringify({ error: "Błąd serwera" }), 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await params.userId;

    await connectToDB();
    const user = await User.findById(userId);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Użytkownik nie znaleziony" }), 
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(userId);

    return new Response(
      JSON.stringify({ message: "Konto zostało usunięte" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas usuwania konta:", error);
    return new Response(
      JSON.stringify({ error: "Błąd serwera" }), 
      { status: 500 }
    );
  }
}