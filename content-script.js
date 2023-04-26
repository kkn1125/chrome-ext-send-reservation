(() => {
  let selection = {
    textTarget: null,
    sendBtn: null,
  };
  let isSelecting = false;
  let isSendSelecting = false;
  let timer = 1000;
  let timeRead = undefined;
  let delay;
  let reserve;
  let restTime;
  let reserveContent = "";
  let wrapper;
  let ta;
  let btn;
  let btnWrap;
  let selectBtn;
  let sendBtn;
  let selectBar;
  let cancelBtn;

  const timestamp = () =>
    `${new Date().getFullYear()}-${
      new Date().getMonth() + 1
    }-${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;

  function createPop() {
    if (document.querySelectorAll("#wrapper"))
      document.querySelectorAll("#wrapper").forEach((el) => el.remove());

    wrapper = document.createElement("div");
    ta = document.createElement("textarea");
    btn = document.createElement("button");
    cancelBtn = document.createElement("button");
    btnWrap = document.createElement("span");
    selectBtn = document.createElement("button");
    sendBtn = document.createElement("button");
    selectBar = document.createElement("select");

    const createOption = (name, value) => {
      const option = document.createElement("option");
      option.value = value;
      option.innerText = name;
      return option;
    };

    for (let i = 1; i <= 60; i++) {
      if (i === 1) {
        timer = i * 1000;
        timeRead = `${i}초`;
      }
      selectBar.append(createOption(`${i}초`, i * 1000));
    }
    for (let i = 1; i <= 60; i++) {
      selectBar.append(createOption(`${i}분`, i * 1000 * 60));
    }

    const style = document.createElement("style");
    style.innerText = `
      #wrapper {
          position: fixed;
          display: flex;
          gap: 10px;
          padding: 1rem;
          border-radius: 10px;
          box-shadow: 0 0 1rem 0 #00000056;
          align-items: stretch;
          bottom: 50%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background-color: #ffffff;
          width: 90vw;
          max-width: 420px;
      }
      #ta {
          flex: 1;
      }
      #btnWrap {
          flex: 'auto';
      }
      #selectBar,
      #ta,
      .buttons {
          outline: none;
          transition: 150ms ease-in-out;
      }
      #selectBar:focus-within, #selectBar:hover,
      .bottons:focus-within, .buttons:hover,
      #ta:focus-within, #ta:hover {
          box-shadow: 0 0 0 5px #67c88b56;
      }
      .buttons {
          border: none;
          background-color: #67c88b;
          color: white;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.5rem;
          border-radius: 0.3rem;
      }
      #btnWrap {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 10px;
      }
      #cancelBtn {
        background-color: red;
      }
    `;

    wrapper.id = "wrapper";
    ta.id = "ta";
    selectBar.id = "selectBar";
    btn.id = "btn";
    cancelBtn.id = "cancelBtn";
    selectBtn.id = "selectBtn";
    sendBtn.id = "sendBtn";
    btnWrap.id = "btnWrap";

    btn.classList.add("buttons");
    selectBtn.classList.add("buttons");
    sendBtn.classList.add("buttons");
    cancelBtn.classList.add("buttons");

    ta.rows = 10;
    ta.autofocus = true;

    btn.innerText = "예약 전송";
    selectBtn.innerText = "내용 삽입 타겟 선택";
    sendBtn.innerText = "내용 보내기 타겟 선택";
    cancelBtn.innerText = "예약 취소";

    btnWrap.append(selectBtn, sendBtn, selectBar, btn);
    wrapper.append(ta, btnWrap);

    document.head.append(style);
    document.body.append(wrapper);

    selectBar.addEventListener("change", changeHandler);
    window.addEventListener("click", clickHandler);
    window.addEventListener("contextmenu", rightClick);

    setTimeout(() => {
      ta.focus();
    }, 0);
  }

  function changeHandler(e) {
    timer = Number(e.target.value);
    timeRead = e.target.selectedOptions[0].text;
    console.log(timer, "설정");
  }

  function clickHandler(e) {
    const target = e.target;
    if (target.id === "selectBtn") {
      if (!isSelecting) {
        isSelecting = true;
      }
    }
    if (target.id === "sendBtn") {
      if (!isSendSelecting) {
        isSendSelecting = true;
      }
    }
    if (target.id === "cancelBtn") {
      clearInterval(delay);
      clearTimeout(reserve);
      deletePop();
    }
    if (target.id === "btn") {
      if (timer && selection.textTarget && selection.sendBtn) {
        reserveContent = ta.value;
        selection.textTarget.setAttribute("placeholder", ta.value);
        wrapper.innerHTML = `<span>${
          (restTime || timer) / 1000
        }초 후 전송</span> <span>메세지 내용: ${reserveContent}</span> <br/> ${
          cancelBtn.outerHTML
        }`;

        reserve = setTimeout(() => {
          selection.textTarget.innerText = reserveContent;
          selection.textTarget.value = reserveContent;
          console.log(reserveContent);
          console.log(selection.sendBtn);
          selection.sendBtn.click();
          selection.sendBtn?.parentElement?.click?.();
          selection.textTarget.removeAttribute("placeholder");
        }, timer);

        delay = setInterval(() => {
          restTime = (restTime || timer) - 1000;
          wrapper.innerHTML = `<span>${
            restTime / 1000
          }초 후 전송</span> <span>메세지 내용: ${reserveContent}</span> <br/> ${
            cancelBtn.outerHTML
          }`;
          if (restTime <= 0) {
            wrapper.style.flexDirection = "column";
            wrapper.innerHTML = `<strong>예약 전송이 완료되었습니다! [예약 시간: ${timeRead}] [전송된 시간: ${timestamp()}]</strong><br/><span>예약 내용: <br/> ${reserveContent}</span><button class="buttons" onclick="wrapper.remove()">확인</button>`;
            clearInterval(delay);
            clearTimeout(reserve);
            selectBar.removeEventListener("change", changeHandler);
            window.removeEventListener("contextmenu", rightClick);
            window.removeEventListener("click", clickHandler);
            init();
          }
        }, 1000);
      } else {
        if (!selection.textTarget) {
          alert("삽입 텍스트 영역이 설정되지 않았습니다.");
        } else if (!selection.sendBtn) {
          alert("보내기 버튼이 설정되지 않았습니다.");
        }
      }
    }
  }

  function rightClick(e) {
    e.stopPropagation();
    e.preventDefault();

    const target = e.target;

    const closest = (text) => target.closest(text);
    const textarea =
      closest("input") ||
      closest("textarea") ||
      (closest("input")?.hasAttribute("contenteditable") && closest("input")) ||
      (closest("textarea")?.hasAttribute("contenteditable") &&
        closest("textarea")) ||
      (target.tagName === "TEXTAREA" && target) ||
      (target.hasAttribute("contenteditable") && target);
    console.log(textarea);
    const button = closest("button");

    if (!selection.textTarget && isSelecting && textarea) {
      console.log("select text target", textarea);
      selection.textTarget = textarea;
      isSelecting = false;
      alert("메세지 입력란이 정상 등록 되었습니다.");
      return;
    } else if (!selection.textTarget && isSelecting && !textarea) {
      alert(
        '텍스트 입력 부분은 "textarea" 또는 "contenteditable" 속성이 있는 영역이어야 합니다.\n다시 우클릭하여 설정해주세요. (내용 삽입 타겟 선택 되어 있는 상태입니다.)'
      );
      return;
    }
    if (!selection.sendBtn && isSendSelecting && button) {
      console.log("select send btn", button);
      selection.sendBtn = button;
      isSendSelecting = false;
      alert("메세지 전송 버튼이 정상 등록 되었습니다.");
      return;
    } else if (!selection.sendBtn && isSendSelecting && !button) {
      alert(
        '메세지 전송 버튼에 해당하지 않습니다. "button" 태그여야 합니다.\n다시 우클릭하여 설정해주세요. (내용 보내기 타겟 선택 되어 있는 상태입니다.)'
      );
      return;
    }
  }

  function deletePop() {
    selectBar.removeEventListener("change", changeHandler);
    window.removeEventListener("click", clickHandler);
    window.removeEventListener("contextmenu", rightClick);
    wrapper.remove();
    init();
  }

  let isPop = false;

  function init() {
    clearInterval(delay);
    clearTimeout(reserve);

    selection = {
      textTarget: null,
      sendBtn: null,
    };
    isSelecting = false;
    isSendSelecting = false;
    timer = 1000;
    timeRead = undefined;
    delay = undefined;
    reserve = undefined;
    restTime = undefined;
    reserveContent = "";
    wrapper = undefined;
    ta = undefined;
    btn = undefined;
    btnWrap = undefined;
    selectBtn = undefined;
    sendBtn = undefined;
    selectBar = undefined;
    cancelBtn = undefined;
    isPop = false;
  }

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key === "r") {
      if (!isPop) {
        createPop();
        isPop = true;
      } else {
        deletePop();
        isPop = false;
      }
    }
  });
})();
