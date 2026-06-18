import { appBarHeight } from "~/utils";
import type { AppsData } from "~/types";

const apps: AppsData[] = [
  {
    id: "launchpad",
    title: "Launchpad",
    desktop: false,
    img: "img/icons/launchpad.png"
  },
  {
    id: "bear",
    title: "Bear",
    desktop: true,
    width: 860,
    height: 500,
    show: true,
    y: -40,
    img: "img/icons/bear.png",
    content: <Bear />
  },
  {
    id: "typora",
    title: "Typora",
    desktop: true,
    width: 600,
    height: 580,
    y: -20,
    img: "img/icons/typora.png",
    content: <Typora />
  },
  {
    id: "safari",
    title: "Safari",
    desktop: true,
    width: 1024,
    minWidth: 375,
    minHeight: 200,
    x: -20,
    img: "img/icons/safari.png",
    content: <Safari />
  },
  {
    id: "Youtube",
    title: "Youtube",
    desktop: true,
    width: 500,
    height: 300,
    x: 80,
    y: -30,
    img: "https://www.youtube.com/s/desktop/4981804c/img/logos/favicon_144x144.png",
    iframeSrc: "https://www.youtube.com/embed/Wj0bFJLs92A?si=cYOhl25FChFiOWjU",
    iframeVersion: "0.0.1"
  },
  {
    id: "Book",
    title: "Book",
    desktop: true,
    width: 1024,
    height: 600,
    x: 80,
    y: -30,
    img: "https://cdn.readest.com/images/readest-icon.png",
    iframeSrc: "https://web.readest.com/library",
    iframeVersion: "0.0.1"
  },
  {
    id: "ownpie",
    title: "Own Pie",
    desktop: true,
    width: 350,
    height: 600,
    x: 80,
    y: -30,
    img: "img/icons/sunrise-calendar.avif",
    iframeSrc: "https://o.mkpie.me/app/ownpie/",
    iframeVersion: "0.0.1"
  },
  {
    id: "deltekpro",
    title: "Deltek Pro",
    desktop: true,
    dock: false,
    width: 640,
    height: 600,
    img: "https://messenger-assets.qualified.com/uploads/7umMCBSyWG9adXjQX5fwFzgbAtESPgTSZo2r5/b8dc7515ddfbeacc7c2b2e4c85a568359289ed3a7477f328c6fc50553306fb77.png",
    iframeSrc: "https://o.mkpie.me/static/cloud/usertemp/101412127/Deltek_report.html",
    iframeVersion: "0.0.1"
  },
  {
    id: "joglog",
    title: "Jog-log",
    desktop: true,
    dock: false,
    width: 640,
    height: 600,
    img: "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/66/95/d0/6695d0b8-a4dc-8e49-9c58-5266b699d2eb/Placeholder.mill/400x400bb-75.webp",
    iframeSrc: "https://o.mkpie.me/static/cloud/clean-single-bundle.html",
    iframeVersion: "0.0.1"
  },
  {
    id: "vscode",
    title: "VSCode",
    desktop: true,
    width: 900,
    height: 600,
    x: 80,
    y: -30,
    img: "img/icons/vscode.png",
    iframeSrc: "https://github1s.com/jinsanity07git/python-for-transportation-modeling",
    iframeVersion: "0.0.1"
  },
  {
    id: "facetime",
    title: "FaceTime",
    desktop: true,
    img: "img/icons/facetime.png",
    width: 500 * 1.7,
    height: 500 + appBarHeight,
    minWidth: 350 * 1.7,
    minHeight: 350 + appBarHeight,
    aspectRatio: 1.7,
    x: -80,
    y: 20,
    content: <FaceTime />
  },
  {
    id: "terminal",
    title: "Terminal",
    desktop: true,
    img: "img/icons/terminal.png",
    content: <Terminal />
  },
  {
    id: "github",
    title: "Github",
    desktop: false,
    img: "img/icons/github.png",
    link: "https://github.com/codespaces"
  },
  {
    id: "claude",
    title: "Claude",
    desktop: false,
    img: "img/icons/claude.png",
    link: "https://claude.ai/"
  }
];

export default apps;
