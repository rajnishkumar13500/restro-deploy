import express from "express";
import { UserRouter } from "../modules/user/user.route";
import {RestaurantRouter } from "../modules/restaurant/restaurant.routes"
import { RoleRouter } from "../modules/role/role.routes";
import { customerRouter } from "../modules/customer/customer.routes";
import { ownerRouter } from "../modules/owner/owner.routes";
import { AuthRouter } from "../modules/auth/auth.routes";
const router = express.Router();

const moduleRoutes = [
  {
    path:"/owner",
    route:ownerRouter,
  },
  {
    path:"/auth",
    route:AuthRouter,
  },
  {
  path: "/restaurant",
  route: RestaurantRouter,
},
{
  path: "/role",
  route: RoleRouter,
},
  {
    path:"/customer",
    route:customerRouter,
  }
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
