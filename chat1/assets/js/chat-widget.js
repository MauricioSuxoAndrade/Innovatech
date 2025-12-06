document.addEventListener("DOMContentLoaded", function () {
	const toggleBtn = document.getElementById("nsChatToggle");
	const closeBtn = document.getElementById("nsChatClose");
	const chatWindow = document.getElementById("nsChatWindow");
	const form = document.getElementById("nsChatForm");
	const input = document.getElementById("nsChatInput");
	const messages = document.getElementById("nsChatMessages");
	const sendBtn = document.getElementById("nsChatSend");

	// Tu endpoint real
	const API_BASE = "https://d2fbe1aabe40.ngrok-free.app/webhook/consulta?consulta=";

	if (!toggleBtn || !chatWindow) return;

	function addMessage(text, from) {
		const wrapper = document.createElement("div");
		wrapper.className = "ns-chat-msg " + (from === "user" ? "ns-chat-msg-user" : "ns-chat-msg-bot");

		const bubble = document.createElement("div");
		bubble.className = "ns-chat-msg-bubble";
		bubble.textContent = text;

		wrapper.appendChild(bubble);
		messages.appendChild(wrapper);
		messages.scrollTop = messages.scrollHeight;
		return bubble;
	}

	function setSending(state) {
		sendBtn.disabled = state;
	}

	toggleBtn.addEventListener("click", () => {
		chatWindow.classList.toggle("open");
		if (chatWindow.classList.contains("open")) {
			setTimeout(() => input.focus(), 100);
		}
	});

	if (closeBtn) {
		closeBtn.addEventListener("click", () => chatWindow.classList.remove("open"));
	}

	form.addEventListener("submit", async function (e) {
		e.preventDefault();
		const text = input.value.trim();
		if (!text) return;

		addMessage(text, "user");
		input.value = "";
		setSending(true);

		const loadingBubble = addMessage("Pensando...", "bot");

		try {
			const url = API_BASE + encodeURIComponent(text);

			const res = await fetch(url, {
				method: "GET",
				headers: {
					"ngrok-skip-browser-warning": "any-value", // 👈 CLAVE PARA SALTAR LA PANTALLA
				}
			});

			if (!res.ok) {
				throw new Error("HTTP " + res.status);
			}

			const contentType = res.headers.get("content-type") || "";
			let answerText = "";

			if (contentType.includes("application/json")) {
				const data = await res.json();
				answerText = data.respuesta || data.answer || JSON.stringify(data);
			} else {
				answerText = await res.text();
			}

			loadingBubble.textContent = answerText;
		} catch (err) {
			console.error(err);
			loadingBubble.textContent = "Hubo un error contactando al asistente.";
		} finally {
			setSending(false);
		}
	});
});
