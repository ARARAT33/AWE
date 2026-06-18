// 1. Architecture Map Data
const archData = {
    user: {
        title: "User Space (Ring 3) Execution",
        text: "Այստեղ աշխատում են սովորական ծրագրերը։ Նրանք չունեն ուղիղ հասանելիություն RAM-ին կամ I/O պորտերին։ Երբ ծրագրին պետք է ֆայլ կարդալ կամ հիշողություն ուզել, այն կատարում է `syscall` հրամանը՝ կառավարումը հանձնելով CellKernel-ին։"
    },
    kernel: {
        title: "CellKernel Core Operations (Ring 0)",
        text: "Օպերացիոն համակարգի ամենապաշտպանված հատվածը։ Ունի լրիվ վերահսկողություն CPU-ի վրա։ Այստեղ Rust-ով գրված մոդուլները կառավարում են IDT-ն (Interrupts Descriptor Table), էջավորումը (CR3 register mapping) և թելերը (thread scheduler)։"
    },
    hardware: {
        title: "Physical / Virtual Hardware Interfacing",
        text: "Ֆիզիկական պրոցեսորը և մայրական սալիկը։ CellKernel-ը ծրագրավորում է APIC-ը (Advanced Programmable Interrupt Controller) ժամանակաչափի (Timer) համար և հաղորդակցվում է MMU-ի (Memory Management Unit) հետ՝ հասցեները թարգմանելու համար։"
    }
};

function showArchDetails(layer) {
    const box = document.getElementById("arch-details");
    box.innerHTML = `<h3><i class="fa-solid fa-microchip"></i> ${archData[layer].title}</h3><p style="margin-top:10px; color:#cbd5e1;">${archData[layer].text}</p>`;
}

// 2. Live Kernel Log Monitor
function triggerLog(type) {
    const screen = document.getElementById("terminal-log");
    const timestamp = (window.performance.now() / 1000).toFixed(6);
    let message = "";

    if (type === 'irq') {
        const irqVector = Math.floor(Math.random() * 16);
        message = `<p class="system-msg" style="color:#4ade80;">[${timestamp}] [IRQ] Hardware Interrupt caught at vector 0x0${irqVector.toString(16).toUpperCase()}. Executing ISR...</p>`;
    } else if (type === 'malloc') {
        const bytes = Math.floor(Math.random() * 4096);
        const hexAddr = "0x" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
        message = `<p class="system-msg" style="color:#00f2fe;">[${timestamp}] [MM] kmalloc(${bytes} bytes) -> Allocated successfully at Physical Address ${hexAddr}</p>`;
    } else if (type === 'panic') {
        message = `<p class="system-msg" style="color:#ff3333; font-weight:bold;">[${timestamp}] [PANIC] !!! KERNEL PANIC: CRITICAL_PAGE_FAULT at 0x00000000 !!!<br>[${timestamp}] [PANIC] Code: 0x02 (Page not present) | Instruction Pointer: 0x00104A2F<br>[${timestamp}] [PANIC] System halted. Processor entering infinite loop (cli; hlt).</p>`;
    }

    screen.innerHTML += message;
    screen.scrollTop = screen.scrollHeight; // Auto-scroll to bottom
}

function clearTerminal() {
    document.getElementById("terminal-log").innerHTML = '<p class="system-msg">[INFO] Log buffer cleared. Monitoring active...</p>';
}

// 3. MMU Virtual Address Calculator
function calculateAddress() {
    let input = document.getElementById("hex-address").value.trim();
    
    // Հեռացնել 0x նախդիրը եթե կա
    if(input.startsWith("0x") || input.startsWith("0X")) {
        input = input.substring(2);
    }

    // Ստուգել արդյոք վավեր hex է
    let parsed = parseInt(input, 16);
    if (isNaN(parsed)) {
        alert("Խնդրում ենք մուտքագրել վավեր Hex հասցե (օրինակ՝ 0x3A4F1C04)");
        return;
    }

    // Ապահովել 32 բիթանոց բինար տեսք
    let binaryStr = parsed.toString(2).padStart(32, '0');

    // Բաժանում ըստ x86 32-bit Paging սխեմայի (10 + 10 + 12 բիթեր)
    let pdiBin = binaryStr.substring(0, 10);
    let ptiBin = binaryStr.substring(10, 22);
    let offsetBin = binaryStr.substring(22, 32);

    // Փոխակերպում տասնորդականի (Dec)
    let pdiDec = parseInt(pdiBin, 2);
    let ptiDec = parseInt(ptiBin, 2);
    let offsetDec = parseInt(offsetBin, 2);

    // Տվյալների արտացոլում աղյուսակում
    document.getElementById("res-pdi-bin").innerText = pdiBin.replace(/(.{5})/g, '$1 ');
    document.getElementById("res-pdi-dec").innerText = pdiDec;

    document.getElementById("res-pti-bin").innerText = ptiBin.replace(/(.{6})/g, '$1 ');
    document.getElementById("res-pti-dec").innerText = ptiDec;

    document.getElementById("res-off-bin").innerText = offsetBin.replace(/(.{6})/g, '$1 ');
    document.getElementById("res-off-dec").innerText = offsetDec + ` (0x${offsetDec.toString(16).toUpperCase()})`;
}
