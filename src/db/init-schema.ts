import { DataTypes, QueryInterface } from 'sequelize';
import { withTransaction } from './db-utils';

export async function createRecordTable(sequelize: QueryInterface) {
  await withTransaction(sequelize, async (transaction) => {
    await sequelize.createTable( 'record',
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        customer: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        merchant: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cid: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        size: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        token: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        price: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        blockNumber: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        chainType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        txHash: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        timestamp: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        tryout: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        transaction,
      },
    );
  });
}
