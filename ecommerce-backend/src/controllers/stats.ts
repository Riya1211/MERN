import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import {
  calculatePercentage,
  getCategory,
  getMonthData,
} from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};
  const key = "admin-stats";

  if (myCache.has(key)) {
    stats = JSON.parse(myCache.get(key) as string);
  } else {
    /* TOP FOUR CARDS STARTS */
    const today = new Date();

    // To calculate % in the admin dashboard card

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    // User Promise

    const thisMonthUserPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUserPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    // Order Promise

    const thisMonthOrderPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrderPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    /* TOP FOUR CARDS ARE END */

    /* REVENUE & TRANSACTION BAR CHART */
    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

    const lastSixMonthOrderPromise = Order.find({
      createdAt: {
        $gte: sixMonthAgo,
        $lte: today,
      },
    });

    /* LATEST TRANSACTION CARD */
    const latestTransactionPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthUsers,
      thisMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      lastMonthOrders,
      productCount,
      userCount,
      allOrders,
      lastSixMonthOrder,
      categories,
      femaleUsersCount,
      latestTransaction,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthUserPromise,
      thisMonthOrderPromise,
      lastMonthProductsPromise,
      lastMonthUserPromise,
      lastMonthOrderPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrderPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    // Can do it this way also but the above one is clean
    // const userChangePercent = calculatePercentage(thisMonthUsers.length, lastMonthUsers.length);

    // const productChangePercent = calculatePercentage(thisMonthProducts.length, lastMonthProducts.length);

    // const orderChangePercent = calculatePercentage(thisMonthOrders.length, lastMonthOrders.length);

    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue: revenue,
      product: productCount,
      user: userCount,
      order: allOrders.length,
    };

    /* REVENUE & TRANSACTION BAR CHART */
    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthlyRevenue = new Array(6).fill(0);
        // Can use the function getMonthData()
    lastSixMonthOrder.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    /* INVENTORY CARD */

    const categoryCount = await getCategory({ categories, productCount });

    /* GENDER RATIO CARD */

    const userRatio = {
      male: userCount - femaleUsersCount,
      female: femaleUsersCount,
    };

    const modifiedLatestTransaction = latestTransaction.map((i) => ({
      _id: i.id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    stats = {
      categoryCount,
      changePercent,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      userRatio,
      latestTransaction: modifiedLatestTransaction,
    };

    myCache.set(key, JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-pie-charts";
  if (myCache.has(key)) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    const allOrderPromise = Order.find({}).select([
      "total",
      "discount",
      "subTotal",
      "tax",
      "shippingCharges",
    ]);

    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      categories,
      productCount,
      productOutOfStock,
      allOrders,
      allUsers,
      adminUsers,
      customerUsers,
    ] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      allOrderPromise,
      User.find({}).select(["dob"]),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
    ]);

    const orderFullFillment = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    // Category Charts
    const productCategories = await getCategory({ categories, productCount });

    // Stock Availaibilty Chart
    const stockAvailability = {
      inStock: productCount - productOutOfStock,
      productOutOfStock: productOutOfStock,
    };

    // Revenue Distribution

    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = Math.round(grossIncome * (30 / 100));

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    // User Chaerts
    const adminCustomer = {
      admin: adminUsers,
      customer: customerUsers,
    };

    // Age chart

    const usersAgeGroup = {
      teen: allUsers.filter((i) => i.age < 20).length,
      adult: allUsers.filter((i) => i.age >= 20 && i.age < 50).length,
      old: allUsers.filter((i) => i.age >= 50).length,
    };

    charts = {
      orderFullFillment,
      productCategories,
      stockAvailability,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer,
    };

    myCache.set(key, JSON.stringify(charts));
  }
  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getBarCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-bar-charts";

  if (myCache.has(key)) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    // Last Six Month Users and Products
    const today = new Date();

    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

    const twelveMonthAgo = new Date();
    twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

    const lastSixMonthProductPromise = Product.find({
      createdAt: {
        $gte: sixMonthAgo,
        $lte: today,
      },
    }).select("createdAt");

    const lastSixMonthUsersPromise = User.find({
      createdAt: {
        $gte: sixMonthAgo,
        $lte: today,
      },
    }).select("createdAt");

    const lastTwelveMonthOrderPromise = Order.find({
      createdAt: {
        $gte: twelveMonthAgo,
        $lte: today,
      },
    }).select("createdAt");

    const [lastSixMonthProduct, lastSixMonthUsers, lastTwelveMonthOrder] =
      await Promise.all([
        lastSixMonthProductPromise,
        lastSixMonthUsersPromise,
        lastTwelveMonthOrderPromise,
      ]);

    const productCounts = getMonthData({
      length: 6,
      docArr: lastSixMonthProduct,
      today,
    });
    const userCounts = getMonthData({
      length: 6,
      docArr: lastSixMonthUsers,
      today,
    });
    const orderCounts = getMonthData({
      length: 12,
      docArr: lastTwelveMonthOrder,
      today,
    });

    charts = {
      users: userCounts,
      products: productCounts,
      orders: orderCounts,
    };

    myCache.set(key, JSON.stringify(charts));
  }
  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getLineCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-line-charts";

  if (myCache.has(key)) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    // Last 12 Month Data Product and User
    const today = new Date();

    const twelveMonthAgo = new Date();
    twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

    const lastTwelveMonthProductPromise = Product.find({
      createdAt: {
        $gte: twelveMonthAgo,
        $lte: today,
      },
    }).select("createdAt");

    const lastTwelveMonthUserPromise = User.find({
      createdAt: {
        $gte: twelveMonthAgo,
        $lte: today,
      },
    }).select("createdAt");

    const lastTwelveMonthOrderPromise = Order.find({
      createdAt: {
        $gte: twelveMonthAgo,
        $lte: today,
      },
    }).select(["createdAt", "discount", "total"]);

    const [lastTwelveMonthProduct, lastTwelveMonthUser, lastTwelveMonthOrder] = await Promise.all([
      lastTwelveMonthProductPromise,
      lastTwelveMonthUserPromise,
      lastTwelveMonthOrderPromise
    ]);

    const productCounts = getMonthData({
      length: 12,
      docArr: lastTwelveMonthProduct,
      today,
    });

    const userCounts = getMonthData({
      length: 12,
      docArr: lastTwelveMonthUser,
      today,
    });

    const discount = getMonthData({
      length: 12,
      docArr: lastTwelveMonthOrder,
      today,
      property: "discount"
    });

    const revenue = getMonthData({
      length: 12,
      docArr: lastTwelveMonthOrder,
      today,
      property: "total"
    });

    charts = {
      users: userCounts,
      products: productCounts,
      discount: discount,
      revenue: revenue
    };

    myCache.set(key, JSON.stringify(charts));
  }
  return res.status(200).json({
    success: true,
    charts,
  });
});
