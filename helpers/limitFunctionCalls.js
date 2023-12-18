function limitFunctionCalls({ 
	callback, 
	maxFunctionCalls, 
	callsInterval, 
	handleLimitExceeded 
}) {
  let callCount = 0;
  let queueResetTimeout = null;
	let startTime;

	function getTimeLeft() {
		if (!startTime) return null; // Timer not started
		const elapsed = Date.now() - startTime;
		const timeLeft = callsInterval - elapsed;
		const normalizedTimeLeft = Math.floor(timeLeft / 1000 / 60);
		return normalizedTimeLeft > 0 ? normalizedTimeLeft : 0; // Return 0 if time is up
	}

  return function(...args) {
		// Handle over limit of executions
    if (callCount >= maxFunctionCalls) {
			console.log("Лимит вызовов достигнут.");
			let timeLeft = getTimeLeft();
			handleLimitExceeded(timeLeft);
			return;
    }

    // Call function and increment count of calls
    callback(...args);
    callCount++;

    //Set the timer to reset the сallCount if it is the first one after resetting.
    if (callCount === 1) {
			startTime = Date.now();
			queueResetTimeout = setTimeout(() => {
				callCount = 0;
			}, callsInterval);
    }
  };
}

module.exports = limitFunctionCalls;

