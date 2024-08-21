import { patchNotes } from '../../data/patch-note';
import { contractVersion } from '../../signals/contract';

export function PatchNotes() {
    const sortedPatchNotes = [...patchNotes].sort(
        (a, b) => b.version - a.version
    );

    return (
        <div class='container mx-auto px-4'>
            {sortedPatchNotes.map((patchNote) => (
                <div class='my-5'>
                    <h2 class='text-2xl font-semibold text-gray-900 dark:text-white'>
                        {patchNote.humanReadableVersion}{' '}
                        {contractVersion.value?.version === patchNote.version
                            ? '(installed version)'
                            : ''}
                    </h2>
                    <div class='mt-3'>
                        <div class='text-gray-900 dark:text-white'>
                            [ {patchNote.date.toLocaleDateString()} ]{' '}
                            {patchNote.description}
                        </div>
                    </div>
                    <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
                </div>
            ))}
        </div>
    );
}
