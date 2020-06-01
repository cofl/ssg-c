import { Caisson } from "./Caisson";
import Config from "./Config";
import { resolve } from "path";

// TODO: migrate CLI/config loading from to-migrate/index.ts

const caisson = new Caisson(new Config(resolve(process.argv[2] || __dirname)));
caisson.build();
