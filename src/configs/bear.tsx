import type { BearData } from "~/types";

const bear: BearData[] = [
  {
    id: "profile",
    title: "Profile",
    icon: "i-fa-solid:paw",
    md: [
      {
        id: "about-me",
        title: "About Me",
        file: "markdown/about-me.md",
        icon: "i-la:dragon",
        excerpt: "Hey there! welcome to the sanity land..."
      },
      {
        id: "github-stats",
        title: "Github Stats",
        file: "markdown/github-stats.md",
        icon: "i-icon-park-outline:github",
        excerpt: "Here are some status about my github account..."
      },
      {
        id: "about-site",
        title: "About This Site",
        file: "markdown/about-site.md",
        icon: "i-octicon:browser",
        excerpt: "Something about this personal portfolio site..."
      }
    ]
  },
  {
    id: "project",
    title: "Projects",
    icon: "i-octicon:repo",
    md: [
      {
        id: "viz_projectile",
        title: "Projectile motion",
        file: "markdown/projects/viz_projetile.md",
        icon: "i-bi:arrow-up-right-square-fill",
        excerpt: "A light weight simulator of projectile motion...",
        link: "https://jinsanity07git.github.io/blog/files/trim_Functions.html"
      },
      {
        id: "viz_ctpp",
        title: "CTPP Hackathon",
        file: "https://raw.githubusercontent.com/jinsanity07git/utbDoc/refs/heads/master/docs/en/README.md",
        icon: "i-mdi:cloud-print-outline",
        excerpt:
          "A web-based demo for comparing the CTPP data across different states...",
        link: "https://cheerup.us.kg/#/en/"
      },
      {
        id: "viz_sreport",
        title: "Summary Report",
        file: "markdown/projects/viz_sreport.md",
        icon: "i-mdi:chart-tree",
        excerpt:
          "A standalone HTML file that provides a high-level summary of the TDM23 scenario...",
        link: "https://ctps.org/pub/tdm23_sc/tdm23.1.0/Base_2050-Plan.html"
      },
      {
        id: "viz_sankey",
        title: "Macro Orchestration",
        file: "markdown/projects/viz_sankey.md",
        icon: "i-ri:gamepad-line",
        excerpt: "A visual representation of call stack within the TDM23 Macros...",
        link: "https://ctpsstaff.github.io/tdm23_users_guide/1.0/pages/more/tdm23_macros/"
      },
      {
        id: "viz_parallel",
        title: "DMDU Analysis",
        file: "https://raw.githubusercontent.com/CTPSSTAFF/exp_model_trb25/refs/heads/main/README.md",
        icon: "i-mdi:chart-bar-stacked",
        excerpt: "A colab notebook of DMDU analysis...",
        link: "https://github.com/CTPSSTAFF/exp_model_trb25"
      }
    ]
  }
];

export default bear;
