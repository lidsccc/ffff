/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
export function useLoading() {
  const styleContent = `
    :root {
      --color-packman: #00b0bb;
      --color-cubic: #00b0bb;
    }

    .packman {
      height: 18px;
      position: absolute;
      top: 50%;
      left: 50%;
      width: 350px;
      margin-top: -5px;
      background: repeating-linear-gradient(
        90deg,
        var(--color-cubic),
        var(--color-cubic) 5%,
        transparent 5%,
        transparent 35%
      );
      animation: travel 1.2s infinite linear;
    }
    .packman:before,
    .packman:after {
      content: '';
      position: absolute;
      left: -45px;
      top: 50%;
      border: 45px solid var(--color-packman);
      border-radius: 100%;
      margin-top: -45px;
    }
    .packman:before {
      border-left-color: transparent;
      border-bottom-color: transparent;
      animation: chomp 0.35s infinite linear;
    }
    .packman:after {
      border-top-color: transparent;
      border-right-color: transparent;
      animation: chomp-b 0.35s infinite linear;
    }

    @-moz-keyframes travel {
      from {
        background-position: 0 0;
      }
      to {
        background-position: -350px 0;
      }
    }
    @-webkit-keyframes travel {
      from {
        background-position: 0 0;
      }
      to {
        background-position: -350px 0;
      }
    }
    @-o-keyframes travel {
      from {
        background-position: 0 0;
      }
      to {
        background-position: -350px 0;
      }
    }
    @keyframes travel {
      from {
        background-position: 0 0;
      }
      to {
        background-position: -350px 0;
      }
    }
    @-moz-keyframes chomp {
      0% {
        transform: rotate(-45deg);
      }
      50% {
        transform: rotate(-90deg);
      }
      100% {
        transform: rotate(-45deg);
      }
    }
    @-webkit-keyframes chomp {
      0% {
        transform: rotate(-45deg);
      }
      50% {
        transform: rotate(-90deg);
      }
      100% {
        transform: rotate(-45deg);
      }
    }
    @-o-keyframes chomp {
      0% {
        transform: rotate(-45deg);
      }
      50% {
        transform: rotate(-90deg);
      }
      100% {
        transform: rotate(-45deg);
      }
    }
    @keyframes chomp {
      0% {
        transform: rotate(-45deg);
      }
      50% {
        transform: rotate(-90deg);
      }
      100% {
        transform: rotate(-45deg);
      }
    }
    @-moz-keyframes chomp-b {
      0% {
        transform: rotate(-45deg);
      }
      50% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-45deg);
      }
    }
    @-webkit-keyframes chomp-b {
      0% {
        transform: rotate(-45deg);
      }
      50% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-45deg);
      }
    }
    @-o-keyframes chomp-b {
      0% {
        transform: rotate(-45deg);
      }
      50% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-45deg);
      }
    }
    @keyframes chomp-b {
      0% {
        transform: rotate(-45deg);
      }
      50% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-45deg);
      }
    }
    @-moz-keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @-webkit-keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @-o-keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;

  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.innerHTML = styleContent;
  oDiv.className = "packman";

  return {
    appendLoading() {
      if (document.querySelector("#app")) {
        // 主窗口才展示loading
        document.head.appendChild(oStyle);
        document.body.appendChild(oDiv);
      }
    },
    removeLoading() {
      document.head.removeChild(oStyle);
      document.body.removeChild(oDiv);
    },
  };
}
