import { App } from "./modules/app";

const app = new App();

app.get('/', (req, res) => {
  res.status(404).send({
    'cool': 'marcelo',
  })
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});