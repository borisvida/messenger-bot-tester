import * as Promise from 'bluebird'
import * as util from 'util';
import * as rp from 'request-promise';

import * as types from './webhook-types';

export class Message {
    public sender: string;
    public recipient: string;
    public seq: number;
    protected payload: types.TextMessage | types.Postback ;

    constructor(sender: string, recipient: string, seq: number) {
        this.sender = sender;
        this.recipient = recipient;
        this.seq = seq;
    }

    public send(host:string): Promise<void> {
        const payload = {
            url: host,
            qs: { },
            method: 'POST',
            json: this.export(),
        };
        // console.log(util.inspect(payload, {depth: null}));
        return Promise.resolve(rp(payload));
    }

    public export():types.pagePayload {
        return {
            object: "page",
            entry: [
                {
                    id: this.recipient,
                    time: (new Date).getTime(),
                    messaging: [
                        this.payload,
                    ],
                },
            ],
        };
    }
}


export class TextMessage extends Message {
    protected payload: types.TextMessage;
    public create(text: string): this {
        this.payload = {
            sender: {
                id: this.sender,
            },
            recipient: {
                id: this.recipient,
            },
            timestamp: (new Date).getTime(),
            message: {
                mid: `mid.${0}`,
                seq: this.seq,
                text: text,
            },
        };
        return this; 
    }
}

export class DelayMessage extends Message {
    protected delay: number = 0;
    public create(delayMs: number): this {
        this.delay = delayMs;
        return this;
    }
    public send() {
        console.log(`delaying ${this.delay} ms`);
        return Promise.delay(this.delay);
    }
}

export class PostbackMessage extends Message {
    protected payload: types.Postback;
    public create(payload: string): this {
        this.payload = {
            sender: {
                id: this.sender,
            },
            recipient: {
                id: this.sender,
            },
            timestamp: (new Date).getTime(),
            postback: {
                payload: payload,
            },
        };
        return this;
    }
}