import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,

    // để hiển thị tiếng Việt chính xác.
    dialectOptions: {
      charset: 'utf8mb4'
    },


    define: {
      // Tự động chuyển đổi tên cột từ camelCase trong model
      // sang snake_case trong database.
      // Ví dụ: `firstName` -> `first_name`
      underscored: true
    }
  });

export default sequelize;