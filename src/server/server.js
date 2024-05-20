require("dotenv").config();
const Hapi = require("@hapi/hapi");
const routes = require("../server/routes");
const { loadModel } = require("../services/loadModel");
const InputError = require("../exceptions/InputError");
const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  server.route(routes);

  server.ext("onPreResponse", function (request, h) {
    const response = request.response;

    if (response instanceof InputError) {
      const newResponse = h.response({
        status: "fail",
        message: `${response.message} silahkan gunakan foto lain`,
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response.isBoom) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  const model = await loadModel();

  server.app.model = model;

  await server.start();

  console.log("Server running on %s", server.info.uri);
};

init();
