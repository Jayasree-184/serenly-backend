import { prisma } from '../utils/prisma.js';
import { MedicationSchema } from '../validators/index.js';
export async function getMedications(req, res) {
    const userId = req.user.userId;
    const medications = await prisma.medication.findMany({
        where: { userId },
        orderBy: { timeOfDay: 'asc' },
    });
    res.json({
        disclaimer: 'Follow the instructions provided by your healthcare professional.',
        medications,
    });
}
export async function createMedication(req, res) {
    const userId = req.user.userId;
    const data = MedicationSchema.parse(req.body);
    const medication = await prisma.medication.create({
        data: {
            userId,
            name: data.name,
            dose: data.dose,
            timeOfDay: data.timeOfDay,
            frequency: data.frequency,
            instructions: data.instructions,
        },
    });
    res.status(201).json({ medication });
}
export async function deleteMedication(req, res) {
    const userId = req.user.userId;
    const id = String(req.params.id);
    const existing = await prisma.medication.findUnique({
        where: { id },
    });
    if (!existing || existing.userId !== userId) {
        res.status(404).json({ error: 'NotFound', message: 'Medication record not found.' });
        return;
    }
    await prisma.medication.delete({ where: { id } });
    res.json({ message: 'Medication reminder removed.' });
}
