// ensures that script doesn't proceed without JSON being loaded
$.ajaxSetup({
    async: false
});

var jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
})

// use timestamp for sub id
var id = getFormattedDate();

var condition = jsPsych.randomization.randomInt(0, 1)
var all_stim = $.getJSON("json/stim.json").responseJSON;

// select stimuli for condition
var stimuli = all_stim[condition]

/////////////////////////////////////////////////////////
// uncomment to randomize trials!!                     //
// stimuli = jsPsych.randomization.shuffle(stimuli;    //
/////////////////////////////////////////////////////////


var done = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "Thank you for completing the survey. We take your compensation and time seriously! The email for the main experimenter is maxs@mit.edu<br> If you have problems submitting this task, or if it takes much more time than expected, you can either contact us directly through the Prolific portal, or email us with your Prolific ID and the subject line <i>Human experiment compensation for explanation experiment. In either case, we will respond to your messages within 24 - 48 hours.",

    on_start: function() {
        saveData(id, jsPsych.data.get().csv());
    }
}

var trials = [];

var n_blocks = 1;
var trials_per_block = stimuli.length;
var n_trials = n_blocks * trials_per_block;

var start = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Press any key to start.',
    on_start: function() {
        restyle_progress_bar();
        jsPsych.setProgressBar(0);
    }
}

for (var t = 0; t < n_trials; t++) {

    var trial = {
        type: jsPsychHtmlSliderResponse,
        stimulus: stimuli[t],
        require_movement: true,
        labels: ["Explanation 1", "No preference for either of the explanations", "Explanation 2"],
        data: {
            stimulus_id: t,
        },
        on_finish: function(data) { // trial data
            // update progress bar
            var curr_progress = jsPsych.getProgressBarCompleted();
            jsPsych.setProgressBar(curr_progress + (1 / n_trials));

            // save data after each trial
            saveData(id, jsPsych.data.get().csv());
        }
    }

    // trials.push(make_text_trial(stimuli[t]));
    trials.push(trial);

    ///////// we may want to display a message after every N trials, etc
    // if (((t + 1) % trials_per_block == 0) && ((t + 1 < n_trials))) {
    //     trials.push(make_feedback_trial());
    // }
}

// this is here so that we can specify properties that all frames should have, i.e. 'id' etc.
var trial_proc = {
    // background_color: 'black',
    data: {
        id: id,
        condition: condition,
    },
    timeline: trials,
}

timeline = [start, trial_proc, done]

jsPsych.run(timeline);