export const atcVoice = {
  speak: (message, priority = "normal") => {
    if ("speechSynthesis" in window) {
      if (priority === "normal") {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.log("Speech synthesis not supported");
    }
  },
  
  announceResolution: (aircraft, type, value) => {
    let message = "";
    if (type === "altitude") {
      message = `${aircraft}, descend and maintain ${value} feet.`;
    } else if (type === "heading") {
      message = `${aircraft}, turn ${value}.`;
    } else if (type === "speed") {
      message = `${aircraft}, reduce speed to ${value} knots.`;
    } else {
      message = `${aircraft}, ${value}.`;
    }
    atcVoice.speak(message);
    setTimeout(() => {
      atcVoice.speak(`${aircraft} roger.`);
    }, 2000);
  },
  
  announceConflict: (aircraft1, aircraft2, severity) => {
    let message = "";
    if (severity === "CRITICAL") {
      message = `MAYDAY! ${aircraft1} and ${aircraft2} on collision course! Immediate action required!`;
    } else if (severity === "HIGH") {
      message = `Emergency! ${aircraft1} and ${aircraft2} dangerously close!`;
    } else {
      message = `Attention! ${aircraft1} and ${aircraft2} entering conflict zone.`;
    }
    atcVoice.speak(message, "high");
  }
};
