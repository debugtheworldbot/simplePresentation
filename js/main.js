const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const isMain = (str) => /^#{1,2}(?!#)/.test(str);
const isSub = (str) => /^#{3}(?!#)/.test(str);

const convert = (raw) => {
  let arr = raw
    .split(/\n(?=\s*#{1,3}[^#])/)
    .filter((s) => s != "")
    .map((s) => s.trim());

  let html = "";

  for (let i = 0; i < arr.length; i++) {
    if (arr[i + 1] !== undefined) {
      if (isMain(arr[i]) && isMain(arr[i + 1])) {
        html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section >
					`;
      } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
        html += `
					<section>
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section >
					`;
      } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
        html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section >
					`;
      } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
        html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section >
					</section >
					`;
      }
    } else {
      if (isMain(arr[i])) {
        html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section >`;
      } else if (isSub(arr[i])) {
        html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section >
					</section >
					`;
      }
    }
  }
  return html;
};

const Menu = {
  init() {
    this.$settingIcon = $(".control .settings");
    this.$menu = $(".menu");
    this.$closeIcon = $(".menu .close");
    this.$$tabs = $$(".menu .tab");
    this.$$contents = $$(".menu .content");

    this.bind();
  },
  bind() {
    this.$settingIcon.onclick = () => {
      this.$menu.classList.add("open");
    };
    this.$closeIcon.onclick = () => {
      this.$menu.classList.remove("open");
    };
    this.$$tabs.forEach(
      ($tab) =>
        ($tab.onclick = () => {
          this.$$tabs.forEach(($node) => $node.classList.remove("active"));
          $tab.classList.add("active");
          let index = [...this.$$tabs].indexOf($tab);
          this.$$contents.forEach(($node) => {
            $node.classList.remove("active");
          });
          this.$$contents[index].classList.add("active");
        })
    );
  },
};

const ImgUploader = {
  init() {
    this.$fileInput = $("#img-uploader");
    this.$textarea = $(".editor textarea");

    AV.init({
      appId: "42RRTA3eYGNsYl3X8QYKK807-gzGzoHsz",
      appKey: "XhTbaY1BNmLyGUbifR8rz8Ev",
      serverURLs: "https://uqbaasqm.lc-cn-n1-shared.com",
    });

    this.bind();
  },

  bind() {
    let self = this;
    this.$fileInput.onchange = function () {
      if (this.files.length > 0) {
        let localFile = this.files[0];
        console.log(localFile);
        if (localFile.size / 1048576 > 2) {
          alert("文件不能超过2M");
          return;
        }
        self.insertText(`![上传中，进度0%]()`);
        let avFile = new AV.File(encodeURI(localFile.name), localFile);
        avFile
          .save({
            keepFileName: true,
            onprogress(progress) {
              self.insertText(`![上传中，进度${progress.percent}%]()`);
            },
          })
          .then((file) => {
            console.log("文件保存完成");
            console.log(file);
            let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`;
            self.insertText(text);
          })
          .catch((err) => console.log(err));
      }
    };
  },

  insertText(text = "") {
    let $textarea = this.$textarea;
    let start = $textarea.selectionStart;
    let end = $textarea.selectionEnd;
    let oldText = $textarea.value;

    $textarea.value = `${oldText.substring(
      0,
      start
    )}${text} ${oldText.substring(end)}`;
    $textarea.focus();
    $textarea.setSelectionRange(start, start + text.length);
  },
};

const Editor = {
  init() {
    this.$editInput = $(".editor .textarea");
    this.$saveBtn = $(".editor .saveBtn");
    this.$slideContainer = $(".slides");
    this.markdown =
      localStorage.markdown ||
      `
## SIMPLE PRESENTATION
 markdown秒变ppt
## 可以垂直切换哦
### LEVEL1 
- 可以为一个主题增加更多细节
### LEVEL2
- 按上返回
## want more?
按下键...
<p class="fragment fade-up">...继续...</p>

### 多种特效，任君选择
<p class="fragment grow">变大</p>
<p class="fragment shrink">变小</p>
<p class="fragment strike">删除线</p>
<p class="fragment fade-out">淡出</p>
### and more
<section>
	<span class="fragment fade-in">
		<span class="fragment fade-out">I'll fade in, then out
	</span></span>
</section>
  <p class="fragment highlight-current-blue">暂时变色</p>
	<p class="fragment highlight-red">永久变色</p>
  <p class="fragment highlight-green">green！</p>
## 更多视角
- 按住alt点击放大（ctrl + click in Linux）
- 按esc查看缩略图
## 点击左上角了解更多
   `;

    this.bind();
    this.start();
  },
  bind() {
    this.$saveBtn.onclick = () => {
      localStorage.markdown = this.$editInput.value;
      location.reload();
    };
  },
  start() {
    this.$editInput.value = this.markdown;
    this.$slideContainer.innerHTML = convert(this.markdown);

    Reveal.initialize({
      controls: localStorage.controls !== "hide",
      progress: localStorage.progress !== "hide",
      center: localStorage.align !== "left-top",
      transition: localStorage.transition || "convex",
      dependencies: [
        {
          src: "plugin/markdown/marked.js",

          condition: function () {
            return !!document.querySelector("[data-markdown]");
          },
        },
        {
          src: "plugin/markdown/markdown.js",
          condition: function () {
            return !!document.querySelector("[data-markdown]");
          },
        },
        { src: "plugin/highlight/highlight.js" },
        { src: "plugin/search/search.js", async: true },
        { src: "plugin/zoom-js/zoom.js", async: true },
        { src: "plugin/notes/notes.js", async: true },
      ],
    });
  },
};

const Theme = {
  init() {
    this.$$figures = $$(".theme figure");
    this.$transition = $(".theme .transition");
    this.$align = $(".theme .align");
    this.$reveal = $(".reveal");
    this.$progress = $(".theme .progress");
    this.$controls = $(".theme .controls");

    this.bind();
    this.loadTheme();
  },
  bind() {
    this.$$figures.forEach(
      ($figure) =>
        ($figure.onclick = () => {
          this.$$figures.forEach(($item) => $item.classList.remove("select"));
          $figure.classList.add("select");
          this.setTheme($figure.dataset.theme);
        })
    );
    this.$transition.onchange = function () {
      localStorage.transition = this.value;
      location.reload();
    };
    this.$align.onchange = function () {
      localStorage.align = this.value;
      location.reload();
    };
    this.$progress.onchange = function () {
      localStorage.progress = this.value;
      location.reload();
    };
    this.$controls.onchange = function () {
      localStorage.controls = this.value;
      location.reload();
    };
  },
  setTheme(theme) {
    localStorage.theme = theme;
    location.reload();
  },
  loadTheme() {
    let theme = localStorage.theme || "night";
    let $link = document.createElement("link");
    $link.rel = "stylesheet";
    $link.href = `css/theme/${theme}.css`;
    document.head.appendChild($link);
    this.$transition.value = localStorage.transition || "convex";
    this.$align.value = localStorage.align || "center";
    this.$progress.value = localStorage.progress || "display";
    this.$controls.value = localStorage.controls || "display";

    this.$reveal.classList.add(this.$align.value);
    this.$reveal.classList.add(this.$progress.value);
    this.$reveal.classList.add(this.$controls.value);

    [...this.$$figures]
      .find(($figure) => $figure.dataset.theme === theme)
      .classList.add("select");
  },
};

const App = {
  init() {
    [...arguments].forEach((module) => module.init());
  },
};

App.init(Menu, ImgUploader, Editor, Theme);
