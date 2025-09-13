import Product from "../models/product.model.js";

export class ProductService {
    static async getPaginatedProducts(queryParams) {
        const { limit = 10, page = 1, sort, query } = queryParams;

        const filter = query
            ? {$or: [{category: query}, {status: query === 'true' }]} 
            : {};

        const sortOption = sort === 'asc' ? {price: 1} : sort === 'desc' ? { price: -1 } : {};

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOption,
            lean: true
        };

        return await Product.paginate(filter, options);
    }

    static async buildPaginationLinks(result, limit, sort, query, basePath) {
        return {
            prevLink: result.hasPrevPage 
                ? `${basePath}?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` 
                : null,
            nextLink: result.hasNextPage 
                ? `${basePath}?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` 
                : null
        };
    }
}