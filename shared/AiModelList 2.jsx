export default [
    {
        model: "GPT",
        icon: "/gpt.png",
        premium: false,
        enable: true,
        systemPrompt: "Sen OpenAI tarafından geliştirilen GPT modelisin. Yardımsever, profesyonel ve bilgilendirici bir asistansın.",
        subModel: [
            { name: "GPT 3.5", premium: false, id: "gpt-3.5" },
            { name: "GPT 3.5 Turbo", premium: false, id: "gpt-3.5-turbo" },
            { name: "GPT 4.1 Mini", premium: false, id: "gpt-4.1-mini" },
            { name: "GPT 4.1", premium: true, id: "gpt-4.1" },
            { name: "GPT 5 Nano", premium: false, id: "gpt-5-nano" },
            { name: "GPT 5 Mini", premium: false, id: "gpt-5-mini" },
            { name: "GPT 5", premium: true, id: "gpt-5" },
        ],
    },

    {
        model: 'Gemini',
        icon: '/gemini.png',
        premium: false,
        enable: true,
        systemPrompt: "Sen Google tarafından geliştirilen Gemini modelisin. Veriye dayalı, mantıklı ve çok yönlü cevaplar verirsin.",
        subModel: [
            { name: 'Gemini 2.5 Lite', premium: false, id: "gemini-2.5-flash-lite" },
            { name: 'Gemini 2.5 Flash', premium: false, id: "gemini-2.5-flash" },
            { name: 'Gemini 2.5 Pro', premium: true, id: "Gemini 2.5 Pro" },
        ],
    },

    {
        model: "DeepSeek",
        icon: "/deepseek.png",
        premium: false,
        enable: true,
        systemPrompt: "Sen DeepSeek tarafından geliştirilen bir yapay zekasın. Özellikle kodlama, matematik ve teknik konularda uzmansın.",
        subModel: [
            { name: "DeepSeek R1", premium: false, id: "DeepSeek-R1" },
            { name: "DeepSeek R1 0528", premium: true, id: "DeepSeek-R1-0528" },
        ],
    },

    {
        model: "Mistral",
        icon: "/mistral.png",
        premium: true,
        enable: true,
        systemPrompt: "Sen Mistral AI tarafından geliştirilen bir modelisin. Avrupalı bir yaklaşım ve yüksek verimlilikle cevap verirsin.",
        subModel: [
            { name: "Ministral Medium 2505", premium: true, id: "mistral-medium-2505" },
            { name: "Ministral 3B", premium: true, id: "Ministral-3B" },
        ],
    },

    {
        model: "Grok",
        icon: "/grok.png",
        premium: true,
        enable: true,
        systemPrompt: "Sen xAI tarafından geliştirilen Grok modelisin. Esprili, doğrudan, biraz asi ve gerçek zamanlı bilgilere önem veren bir yapın var.",
        subModel: [
            { name: "Grok 3 Mini", premium: true, id: "grok-3-mini" },
            { name: "Grok 3", premium: true, id: "grok-3" },
        ],
    },

    {
        model: "Cohere",
        icon: "/cohere.png",
        premium: true,
        enable: true,
        systemPrompt: "Sen Cohere tarafından geliştirilen bir modelisin. Kurumsal düzeyde, net ve dil işleme konusunda çok yetenekli bir asistansın.",
        subModel: [
            { name: "Cohere Command A", premium: true, id: "cohere-command-a" },
            { name: "Cohere Command R 08-2024", premium: true, id: "Cohere-command-r-08-2024" },
        ],
    },

    {
        model: "Llama",
        icon: "/llama.png",
        premium: true,
        enable: true,
        systemPrompt: "Sen Meta tarafından geliştirilen açık kaynaklı Llama modelisin. Arkadaş canlısı, bilgilendirici ve geniş bilgi birikimine sahipsin.",
        subModel: [
            { name: "Llama 3.3 70B Instruct", premium: true, id: "Llama-3.3-70B-Instruct" },
            { name: "Llama 4 Scout 17B 16E Instruct", premium: true, id: "Llama-4-Scout-17B-16E-Instruct" },
        ],
    },
];