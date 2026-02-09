import { createRouter } from "../../lib/create-app";
import { requestSponsorshipRoute } from "./sponsor.routes";
import { requestSponsorshipHandler } from "./sponsor.handler";

const router = createRouter().openapi(requestSponsorshipRoute, requestSponsorshipHandler);

export default router;
