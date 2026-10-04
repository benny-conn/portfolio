import { continueRender, delayRender, staticFile } from "remotion"

const handle = delayRender("Loading Alte Haas")

const faces = [
  new FontFace("Alte Haas", `url(${staticFile("fonts/AlteHaasRegular.ttf")})`, { weight: "400" }),
  new FontFace("Alte Haas", `url(${staticFile("fonts/AlteHaasBold.ttf")})`, { weight: "700" }),
]

Promise.all(faces.map((face) => face.load()))
  .then((loaded) => {
    loaded.forEach((face) => document.fonts.add(face))
    continueRender(handle)
  })
  .catch((err) => {
    console.error(err)
    continueRender(handle)
  })
