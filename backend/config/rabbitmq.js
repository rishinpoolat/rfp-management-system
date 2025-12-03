import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

// Queue names
export const QUEUES = {
  EMAIL: 'email_queue',
  AI_PARSING: 'ai_parsing_queue',
  PROPOSAL_COMPARISON: 'proposal_comparison_queue',
};

/**
 * Connect to RabbitMQ and create channel
 */
export async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Assert all queues
    await channel.assertQueue(QUEUES.EMAIL, { durable: true });
    await channel.assertQueue(QUEUES.AI_PARSING, { durable: true });
    await channel.assertQueue(QUEUES.PROPOSAL_COMPARISON, { durable: true });

    console.log('✓ RabbitMQ: Connected and queues initialized');

    // Handle connection events
    connection.on('error', (err) => {
      console.error('✗ RabbitMQ: Connection error:', err.message);
    });

    connection.on('close', () => {
      console.log('RabbitMQ: Connection closed');
      // Reconnect after delay
      setTimeout(connectRabbitMQ, 5000);
    });

    return { connection, channel };
  } catch (error) {
    console.error('✗ RabbitMQ: Failed to connect:', error.message);
    // Retry connection after delay
    setTimeout(connectRabbitMQ, 5000);
    return null;
  }
}

/**
 * Get the current channel
 */
export function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ first.');
  }
  return channel;
}

/**
 * Publish a message to a queue
 * @param {string} queue - Queue name
 * @param {object} data - Data to send
 */
export async function publishToQueue(queue, data) {
  try {
    const ch = getChannel();
    const message = JSON.stringify(data);
    ch.sendToQueue(queue, Buffer.from(message), {
      persistent: true,
    });
    console.log(`✓ RabbitMQ: Message published to ${queue}`);
    return true;
  } catch (error) {
    console.error(`✗ RabbitMQ: Failed to publish to ${queue}:`, error.message);
    return false;
  }
}

/**
 * Consume messages from a queue
 * @param {string} queue - Queue name
 * @param {function} callback - Function to process messages
 */
export async function consumeFromQueue(queue, callback) {
  try {
    const ch = getChannel();
    await ch.prefetch(1); // Process one message at a time

    ch.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          try {
            const data = JSON.parse(msg.content.toString());
            console.log(`Processing message from ${queue}:`, data);

            await callback(data);

            ch.ack(msg); // Acknowledge successful processing
          } catch (error) {
            console.error(`Error processing message from ${queue}:`, error);
            // Reject and don't requeue if processing fails
            ch.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );

    console.log(`✓ RabbitMQ: Consumer started for ${queue}`);
  } catch (error) {
    console.error(`✗ RabbitMQ: Failed to consume from ${queue}:`, error.message);
  }
}

/**
 * Close RabbitMQ connection
 */
export async function closeRabbitMQ() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('✓ RabbitMQ: Connection closed gracefully');
  } catch (error) {
    console.error('✗ RabbitMQ: Error closing connection:', error.message);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeRabbitMQ();
  process.exit(0);
});

export default {
  connect: connectRabbitMQ,
  getChannel,
  publishToQueue,
  consumeFromQueue,
  close: closeRabbitMQ,
  QUEUES,
};
