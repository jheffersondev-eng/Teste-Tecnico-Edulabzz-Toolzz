<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Sanctum\Sanctum;
use Backend\Domain\Entities\User;
use Backend\Infrastructure\Auth\PersonalAccessToken;
use Psr\Http\Client\ClientInterface;
use Symfony\Component\HttpClient\Psr18Client;
use Elastic\Elasticsearch\Client as ElasticsearchClient;
use Elastic\Elasticsearch\ClientBuilder;
use Matchish\ScoutElasticSearch\ElasticSearch\Config\Config as ElasticsearchConfig;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ClientInterface::class, function () {
            return new Psr18Client();
        });

        $this->app->singleton(ElasticsearchClient::class, function () {
            $clientBuilder = ClientBuilder::create()
                ->setHosts(ElasticsearchConfig::hosts())
                ->setSSLVerification(ElasticsearchConfig::sslVerification());

            if ($user = ElasticsearchConfig::user()) {
                $clientBuilder->setBasicAuthentication($user, ElasticsearchConfig::password());
            }

            if ($cloudId = ElasticsearchConfig::elasticCloudId()) {
                $clientBuilder->setElasticCloudId($cloudId)
                    ->setApiKey(ElasticsearchConfig::apiKey());
            }

            return $clientBuilder->build();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
        Relation::morphMap([
            'App\\Models\\User' => User::class,
        ]);
    }
}
