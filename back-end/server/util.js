const { ErrorEvent, Messages } = require("../models/events");
const Events = require("./events");

module.exports = {
	getResource: async function(_id, method, options, populate) {
		if (!_id) {
			throw new Error("No id supplied for resource method.");
		}
		let resource;
		if (populate) {
			resource = await method(_id, options).populate(populate);
		} else {
			resource = await method(_id, options);
		}
		if (!resource) {
			throw new Error(
				`${method.name}: No resource found with that id. (${_id})`
			);
		}
		return resource;
	},

	createResponse: data => {
		const isError = data instanceof Error;
		const response = {
			success: isError ? false : true
		};
		if (isError) {
			response.apiError = {
				message: data.message,
				stack: data.stack
			};
		} else {
			response.apiData = data;
		}
		return response;
	},
	log: async event => {
		event = await event.save();
		console.log(`[${event.createdAt}]: ${event}`);
		return event;
	},
	logEvent: async (type, options, internal = true) => {
		const newEvent = new type(
			Object.assign(
				{
					internal
				},
				options
			)
		);
		return await module.exports.log(newEvent);
	},
	logError: async error => {
		const newEvent = new ErrorEvent({
			message: Messages.INTERNAL_ERROR,
			owner: {},
			error
		});
		return module.exports.log(newEvent);
	},
	refreshNotsClientSide: (req, user) => {
		req.socket.to(user.socketId).emit(Events.REFRESH_NOTIFICATIONS);
	}
};
