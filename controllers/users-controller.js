import express from "express";
import createToken from "../auth/create-token.js";
import usersData from "../data/users-data.js";
import serviceErrors from "../services/service-errors,.js";
import usersService from "../services/users-service.js";
import { createUserSchema } from "../validations/schema/create-user.js";
import { updateUserSchema } from "../validations/schema/update.user.js";
import { createValidator } from "../validations/validator-middleware.js";

const usersController = express.Router();

usersController
    // get all users
    .get("/", async (req, res) => {
        res.status(200).send(await usersService.getAllUsers(usersData));
    })

    // get user's items from shopping cart
    .get("/shoppingCart/:userId", async (req, res) => {
        const { userId } = req.params;
        const { error, models } = await usersService.getUserCartItems(
            usersData
        )(userId);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            res.status(404).send({
                message: `User's items with such ID not found!`,
            });
        } else {
            res.status(200).send(models);
        }
    })

    // add user's items to shopping cart
    .post("/shoppingCart", async (req, res) => {
        const { error, item } = await usersService.addItemInShoppingCart(
            usersData
        )(req.body);

        if (error === serviceErrors.OPERATION_NOT_PERMITTED) {
            res.status(404).send({ message: `Item with such ID not found!` });
        } else {
            res.status(201).send({
                message: `Successfully added item to shopping cart!`,
                item,
            });
        }
    })

    // edit user's items quantity to shopping cart
    .put("/shoppingCart/:id", async (req, res) => {
        const id = req.params.id;
        const { quantity } = req.body;

        const { error, item } = await usersService.editItemQuantity()(
            id,
            quantity
        );

        if (error === serviceErrors.OPERATION_NOT_PERMITTED) {
            res.status(404).send({ message: `Item with such ID not found!` });
        } else {
            res.status(201).send({
                message: `Successfully added item to shopping cart!`,
                item,
            });
        }
    })

    // delete item from shopping cart
    .delete("/shoppingCart/:id", async (req, res) => {
        const id = req.params.id;

        const { error } = await usersService.deleteItem()(id);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            res.status(404).send({ message: `Item with such ID not found!` });
        } else {
            res.status(204).send({
                message: `Successfully deleted item from shopping cart!`,
            });
        }
    })

    // create new user
    .post("/register", createValidator(createUserSchema), async (req, res) => {
        const createData = req.body;

        const { error, user } = await usersService.createUser(usersData)(
            createData
        );

        if (error === serviceErrors.DUPLICATE_RECORD) {
            res.status(409).send({ message: `Email's already used!` });
        } else {
            res.status(201).send({
                message: `Successfully created profile with email: ${user.email}`,
                user,
            });
        }
    })

    .post("/login", async (req, res) => {
        const loginData = req.body;
        const { error, user } = await usersService.signInUser(usersData)(
            loginData
        );

        if (error === serviceErrors.INVALID_SIGNIN) {
            res.status(400).send({
                message: "Invalid email/password",
            });
        } else {
            const payload = {
                sub: user.user_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
            };
            const token = createToken(payload);

            res.status(200).send({
                token: token,
                user: {
                    userId: user.user_id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                },
                message: `Successfully logged in profile`,
            });
        }
    })

    // update user's data by userId
    .put("/update/:id", createValidator(updateUserSchema), async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;

        const { error, user } = await usersService.updateUser(usersData)(
            id,
            updateData
        );

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            res.status(404).send({ message: "Email not found!" });
        } else if (error === serviceErrors.DUPLICATE_RECORD) {
            res.status(409).send({ message: `Email's already used!` });
        } else {
            const payload = {
                sub: user.user_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
            };
            const token = createToken(payload);

            res.status(200).send({
                message: `Successfully updated profile with email: ${user.email}`,
                token: token,
                user: {
                    userId: user.user_id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                },
            });
        }
    })
    .delete("/logout", async (req, res) => {
        res.json({ message: "Successfully logged out!" });
    });
export default usersController;
