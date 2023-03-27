var lastFocusedTrackName;

function main() {
    // Função para abrir a Output da track selecionada e armazenar o nome da track na variável "newName".
    try {
        var newName = sf.ui.proTools.selectedTrackNames[0];
        if (newName === lastFocusedTrackName || newName === undefined) return;

        lastFocusedTrackName = newName;

        if (sf.ui.proTools.selectedTrack.outputWindowButton.value.invalidate().value !== 'open')
            sf.ui.proTools.selectedTrack.trackOutputToggleShow({ onError: 'Continue' });

    } catch (err) {
    }

    // Usa a variável "newName" para procurar e puxar a Window Configuration List com o mesmo nome da track selecionada.
    try {
        var allConfigurationItems = sf.ui.proTools.getMenuItem('Window', 'Configurations').children.first.children.map(c => {
            var m = c.title.value.match(/^(\d+):\s+(.+)$/);
            return {
                num: m && Number(m[1]),
                title: m && m[2],
                element: c,
            };
        }).filter(i => i.num);

        var item = allConfigurationItems.filter(i => i.title === newName)[0];
        if (!item) throw `Could not find window configuration with name: "${newName}"`;

        item.element.elementClick();
        sf.ui.proTools.selectedTrack.outputWindowButton.elementClick();
    } catch (e) {
    }
}


// Função para o script continuar rodando após ser inicializado.
function runForever(name, action, interval, timeout) {
    var now = (new Date).valueOf();
    if (now - globalState[name] < timeout) throw 0; //Exit if we were invoked again inside the timeout

    globalState[name] = now;
    sf.engine.runInBackground(function () {
        try {
            while (true) {
                sf.engine.checkForCancellation();
                globalState[name] = (new Date).valueOf();

                action();

                sf.wait({ intervalMs: interval, executionMode: 'Background' });
            }
        } finally {
            globalState[name] = null;
        }
    });
}

runForever("isFollowFocusedTrackRunning", main, 500, 5000);