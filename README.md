# Atelier

Phone-game human character creator. Man / woman / other. Full-body schematics with art-style transfer.

## Styles

Under **You → Style**:

- **Paint** — stylized digital painting (default)
- **Toon** — anime cel
- **3D** — clay render
- **Real** — painted photoreal

The brush restyles the current full-body figure into the selected look.

## Run

```bash
npm install
npm run dev
```

Brush / style transfer uses `XAI_API_KEY` on the server when you want a fresh still. Switching Paint / Toon / 3D / Real uses the bundled models with no key.

## Use

- Front / side / back on the left — turnaround
- Who + Wear pick the kit
- You → Style transfers the art
- Brush restyles the current figure
- Upload replaces the whole figure
- Save goes to the party list on this device
