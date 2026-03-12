import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        let { dialInNumber, meetingId, passcode } = await req.json();

        if (!dialInNumber || !meetingId) {
            return NextResponse.json(
                { error: 'Missing meeting details' },
                { status: 400 }
            );
        }

        // Sanitize the inputs
        // This removes spaces, parenthesis, and dashes (e.g., "(US) +1 413-418-4561" -> "+14134184561")
        dialInNumber = dialInNumber.replace(/[^+\d]/g, '');
        // This removes spaces and dashes but keeps the digits and '#' (e.g., "838 772 169#" -> "838772169#")
        meetingId = meetingId.replace(/[^\d#]/g, '');


        const VAPI_API_KEY = process.env.VAPI_API_KEY;
        const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
        const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;

        if (!VAPI_API_KEY || !VAPI_ASSISTANT_ID || !VAPI_PHONE_NUMBER_ID) {
            return NextResponse.json(
                { error: 'Server configuration missing' },
                { status: 500 }
            );
        }

        // Vapi has a 10 character limit on the 'extension' field.
        // Google Meet PINs are usually 9 digits, so we just send the meeting ID.
        // In this native mode, Vapi waits for the prompt automatically before sending the extension.
        const dtmfDigits = meetingId;


        const response = await fetch('https://api.vapi.ai/call/phone', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assistantId: VAPI_ASSISTANT_ID,
                phoneNumberId: VAPI_PHONE_NUMBER_ID, // Vapi calls FROM this number
                customer: {
                    number: dialInNumber, // Vapi calls TO the meeting directly!
                    name: 'Google Meet',
                    extension: dtmfDigits, // This sends the DTMF automatically
                },
                // assistantOverrides: {
                //     endCallFunctionEnabled: true,
                //     clientMessages: ['transcript', 'hang', 'function-call', 'speech-update'],
                //     silenceTimeoutSeconds: 30,
                //     maxDurationSeconds: 1200 // Max 20 mins to prevent extreme billing if it hangs
                // }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Vapi API Error:', data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({ message: 'Call initiated directly to meeting!', vapiData: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
