import { User } from "./types/user.d";
import App from "./modules/app";

const app = new App();

let users: User[] = [
  {
    id: new Date().getTime(),
    name: "teste",
    age: 20,
  },
];

app.get("/", (_req, res) => {
  return res.status(200).send({
    method: "express clone v1.0",
  });
});

app.get("/users/:userId", (req, res) => {
  const { userId } = req.params;
  const user = users.find((user) => user.id === Number(userId));

  if (!user) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  return res.status(200).send(user);
});

app.get("/users", (req, res) => {
  const { name } = req.query;
  const filteredUsers = users.filter((user) =>
    user.name.startsWith(name || "")
  );
  return res.status(200).send(filteredUsers);
});

app.post("/users", (req, res) => {
  const userData = req.body as Omit<User, "id">;
  const newUser = {
    id: new Date().getTime(),
    ...userData,
  };
  users.push(newUser);

  return res.status(201).send(newUser);
});

app.patch("/users/:userId", (req, res) => {
  const { userId } = req.params;
  const userData = req.body as Omit<User, "id">;

  const user = users.find((user) => user.id === Number(userId));
  if (!user) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  const updatedUser = {
    ...user,
    ...userData,
  };
  Object.assign(user, updatedUser);
  return res.status(200).send(updatedUser);
});

app.delete("/users/:userId", (req, res) => {
  const deletedUser = users.find(
    (user) => user.id === Number(req.params.userId)
  );
  if (!deletedUser) {
    return res.status(404).send({
      message: "User not found",
    });
  }
  
  users = users.filter((user) => user.id !== Number(req.params.userId));
  return res.status(200).send(deletedUser);
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
