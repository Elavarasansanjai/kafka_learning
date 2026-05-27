// const Redis = require('ioredis');

// // const redis = new Redis("redis://redis:6379");
// const redis = new Redis();

// redis.on('connect', () => console.log('Redis connected'));
// redis.on('error', (err) => console.error('Redis error', err));

// module.exports = redis;

/////////////////////////// normal redis test code without sentailnes ///////
// const Redis = require("ioredis");

// const redis = new Redis();

// redis.on("connect", () => {
//   console.log("Redis Connected");
// });

// redis.on("error", (err) => {
//   console.log("Redis Error");
// });

// setInterval(async () => {
//   try {
//     const time = new Date().toISOString();

//     await redis.set("time", time);

//     console.log("Stored:", time);
//   } catch (err) {
//     console.log("FAILED");
//   }
// }, 1000);

// module.exports = redis;
/////////////////////////// normal redis test code without sentailnes ///////

const Redis = require("ioredis");

const redis = new Redis({
  sentinels: [
    {
      host: "127.0.0.1",
      port: 26379,
    },
  ],
  name: "mymaster",
});

async function logCurrentNode() {
  try {
    const info = await redis.info("server");

    const port = info.split("\n").find((line) => line.startsWith("tcp_port"));

    console.log("Connected Redis:", port);
  } catch (err) {
    console.log("Cannot fetch node info");
  }
}

redis.on("connect", () => {
  console.log("Redis Connected");

  logCurrentNode();
});

redis.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

redis.on("error", (err) => {
  console.log("Redis Error");
});

setInterval(async () => {
  try {
    await redis.set("time", Date.now());

    console.log("Stored");
  } catch (err) {
    console.log("FAILED");
  }
}, 1000);

setInterval(logCurrentNode, 5000);