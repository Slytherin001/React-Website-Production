import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Connected to Database Successfully Port: ${conn.connection.host}`.bgGreen
        .white
    );
  } catch (error) {
    console.log(`Database Connection Failed`.bgRed.white);
  }
};

export default connectDB;
