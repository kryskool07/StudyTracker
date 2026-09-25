const subjectButton = document.getElementById("subjectButton");
const subjectForm = document.getElementById("subjectForm");
const subjectList = document.getElementById("subjectList");

let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

subjects = subjects.map(function(subject) {
    if (typeof subject === "string") {
        return {
            name: subject,
            comment: "",
            deadline: "",
            tasks: []
        };
    }

    if (!subject.tasks) {
        subject.tasks = [];
    }

    subject.tasks = subject.tasks.map(function(task) {
        if (typeof task === "string") {
            return {
                title: task,
                completed: false
            };
        }

        if (!task.deadline) {
            task.deadline = "";
        }

        return task;
    })

    return subject;
});

subjectButton.addEventListener("click", function() {
    subjectForm.innerHTML = `
        <input id="subjectInput" type="text" placeholder="Skriv inn fag">
        <button id="saveSubjectButton">Lagre fag</button>
    `;

    const subjectInput = document.getElementById("subjectInput");
    const saveSubjectButton = document.getElementById("saveSubjectButton");

    function saveSubject() {
        const subjectName = subjectInput.value;

        if (subjectName.trim() === "") {
            console.log("Value not valid.");
            return;
        }

        subjects.push({
            name: subjectName.trim(),
            comment: "",
            deadline: "",
            tasks: []
        });

        saveSubjects();

        renderSubjects();

        subjectInput.value = "";
    }

    saveSubjectButton.addEventListener("click", function() {
        saveSubject();
    });

    subjectInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            saveSubject();
        }
    });
});

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");

    return day + "." + month + "." + year;
}

function saveSubjects() {
    localStorage.setItem(
        "subjects",
        JSON.stringify(subjects)
    );
}

function createProgressBar(percent, barClass, fillClass) {
    const progressBar = document.createElement("div");
    progressBar.classList.add(barClass);

    const progressFill = document.createElement("div");
    progressFill.classList.add(fillClass);

    progressFill.style.width = percent + "%";

    progressBar.appendChild(progressFill);

    return progressBar;
}

function renderTotalProgress() {
    let totalAllTasks = 0;
    let completedAllTasks = 0;

    subjects.forEach(function(subject) {
        totalAllTasks += subject.tasks.length;

        completedAllTasks += subject.tasks.filter(function(task) {
            return task.completed;
        }).length;
    })

    let totalProgressPercent = 0;

    if (totalAllTasks > 0) {
        totalProgressPercent = Math.round(
            (completedAllTasks / totalAllTasks) * 100
        );
    }

    const totalProgressText = document.createElement("h2");

    totalProgressText.textContent =
    completedAllTasks + " av " +
    totalAllTasks +
    " oppgaver fullført (" +
    totalProgressPercent +
    "%)";

    const totalProgressBar = createProgressBar(
        totalProgressPercent,
        "totalProgressBar",
        "totalProgressFill"
    );

    subjectList.appendChild(totalProgressText);
    subjectList.appendChild(totalProgressBar);
}

function isOverdue(dateString) {
    if (!dateString) {
        return false;
    }

    const deadline = new Date(dateString + "T00:00:00");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deadline < today;
}

function createTaskElement(subject, task, taskIndex){
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");

    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.checked = task.completed;

    const taskText = document.createElement("span");
    taskText.textContent = task.title;

    const taskDeadlineText = document.createElement("p");

    if (task.deadline) {
        taskDeadlineText.textContent =
        "Frist: " + formatDate(task.deadline);
    } else {
        taskDeadlineText.textContent = "Ingen frist";
    }

    const overdueText = document.createElement("p");

    if (task.deadline && isOverdue(task.deadline) && !task.completed) {
        overdueText.textContent = "Forfalt";
        overdueText.classList.add("overdue");
    }

    if (task.completed) {
        taskText.classList.add("completed");
    }

    const deleteTaskButton = document.createElement("button");
    deleteTaskButton.textContent = "Slett";
    deleteTaskButton.classList.add("taskDeleteButton");

    deleteTaskButton.addEventListener("click", function() {
        subject.tasks.splice(taskIndex, 1);

        saveSubjects();
        renderSubjects();
    });

    taskCheckbox.addEventListener("change", function() {
        task.completed = taskCheckbox.checked;

        saveSubjects();
        renderSubjects();
    })

    taskDiv.appendChild(taskCheckbox);
    taskDiv.appendChild(taskText);
    taskDiv.appendChild(taskDeadlineText);
    taskDiv.appendChild(overdueText);
    taskDiv.appendChild(deleteTaskButton);

    return taskDiv;
}

function createSubjectProgress(subject) {
    const completedTasks = subject.tasks.filter(function(task) {
        return task.completed;
    }).length;

    const totalTasks = subject.tasks.length;

    let progressPercent = 0;

    if (totalTasks > 0) {
        progressPercent = Math.round(
            (completedTasks / totalTasks) * 100
        );
    }

    const progressText = document.createElement("p");

    progressText.textContent =
        completedTasks + " av " +
        totalTasks +
        " oppgaver fullført (" +
        progressPercent +
        "%)";

        const progressBar = createProgressBar(
            progressPercent,
            "progressBar",
            "progressFill"
        );

        return {
            progressText,
            progressBar
        };
}

function createSubjectDetails(subject) {
    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("subjectDetails");
    detailsDiv.style.display = "none";

    const commentInput = document.createElement("textarea");
    commentInput.placeholder = "Kommentar...";
    commentInput.value = subject.comment;

    const deadlineInput = document.createElement("input");
    deadlineInput.type = "date";
    deadlineInput.value = subject.deadline;

    const saveDetailsButton = document.createElement("button");
    saveDetailsButton.textContent = "Lagre detaljer";

    saveDetailsButton.addEventListener("click", function() {
        subject.comment = commentInput.value;
        subject.deadline = deadlineInput.value;

        saveSubjects();

        console.log("Detaljer lagret.");

        renderSubjects();
    });

    detailsDiv.appendChild(commentInput);
    detailsDiv.appendChild(deadlineInput);
    detailsDiv.appendChild(saveDetailsButton);

    return detailsDiv;
}

function renderSubjects() {
    subjectList.innerHTML = "";

    renderTotalProgress();

    subjects.forEach(function(subject, index) {
        const {
            progressText,
            progressBar
        } = createSubjectProgress(subject);

        const subjectDiv = document.createElement("div");
        subjectDiv.classList.add("subject");

        const subjectText = document.createElement("span");
        subjectText.textContent = subject.name;

        const commentText = document.createElement("p");

        if (subject.comment && subject.comment.trim() !== "") {
            commentText.textContent = subject.comment;
        } else {
            commentText.textContent = "Ingen detaljer";
        }

        const deadlineText = document.createElement("p");

        if (subject.deadline) {
            deadlineText.textContent =
                "Frist: " + formatDate(subject.deadline);
        } else {
            deadlineText.textContent = "Ingen frist";
        }
        


    
        const editButton = document.createElement("button");
        editButton.textContent = "Rediger";
        editButton.classList.add("editButton");


    
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "Detaljer";
        detailsButton.classList.add("detailsButton");


        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Slett";
        deleteButton.classList.add("deleteButton");

        const addTaskButton = document.createElement("button");
        addTaskButton.textContent = "Legg til oppgave";
        addTaskButton.classList.add("addTaskButton");

        const taskFormDiv = document.createElement("div");
        taskFormDiv.classList.add("taskForm");
        taskFormDiv.style.display = "none";

        const taskInput = document.createElement("input");
        taskInput.type = "text";
        taskInput.placeholder = "Skriv inn oppgave";

        const taskDeadlineInput = document.createElement("input");
        taskDeadlineInput.type = "date";

        const saveTaskButton = document.createElement("button");
        saveTaskButton.textContent = "Lagre Oppgave";

        taskFormDiv.appendChild(taskInput);
        taskFormDiv.appendChild(taskDeadlineInput);
        taskFormDiv.appendChild(saveTaskButton);

        const detailsDiv = createSubjectDetails(subject);

        const taskList = document.createElement("div");
        taskList.classList.add("taskList");

        subject.tasks.forEach(function(task, taskIndex) {
            const taskElement = createTaskElement(
                subject,
                task,
                taskIndex
            );

            taskList.appendChild(taskElement);
        })


        detailsButton.addEventListener("click", function() {
            if (detailsDiv.style.display === "none") {
                detailsDiv.style.display = "block";
            } else {
                detailsDiv.style.display = "none";
            }
        });


     
        editButton.addEventListener("click", function() {
            const newName = prompt(
                "Nytt navn på faget:",
                subject.name
            );

            if (newName === null || newName.trim() === "") {
                return;
            }

            subject.name = newName.trim();

            saveSubjects();

            renderSubjects();
        });


        
        deleteButton.addEventListener("click", function() {
            subjects.splice(index, 1);

            saveSubjects();

            renderSubjects();
        });

    addTaskButton.addEventListener("click", function() {
    if (taskFormDiv.style.display === "none") {
        taskFormDiv.style.display = "block";
        taskInput.focus();
    } else {
        taskFormDiv.style.display = "none";
    }
});

saveTaskButton.addEventListener("click", function() {
    const taskName = taskInput.value;

    if (taskName.trim() === "") {
        return;
    }

    subject.tasks.push({
        title: taskName.trim(),
        completed: false,
        deadline: taskDeadlineInput.value
    });

    saveSubjects();

    taskInput.value = "";

    renderSubjects();
});

const subjectActions = document.createElement("div");
subjectActions.classList.add("subjectActions");

subjectActions.appendChild(addTaskButton);
subjectActions.appendChild(detailsButton);
subjectActions.appendChild(editButton);
subjectActions.appendChild(deleteButton);

        // BYGG FAG-KORTET
        subjectDiv.appendChild(subjectText);
        subjectDiv.appendChild(commentText);
        subjectDiv.appendChild(deadlineText);
        subjectDiv.appendChild(progressText);
        subjectDiv.appendChild(progressBar);
        
        subjectDiv.appendChild(subjectActions);
        
        subjectDiv.appendChild(taskFormDiv);
        subjectDiv.appendChild(taskList);
        subjectDiv.appendChild(detailsDiv);

        subjectList.appendChild(subjectDiv);
    });
}

renderSubjects();